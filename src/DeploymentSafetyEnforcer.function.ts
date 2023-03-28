import { Context } from 'aws-lambda';
import * as aws from 'aws-sdk';
import {
  BakeStepAlarmSettings,
  BakeStepSettings,
  DeploymentSafetySettings,
} from './common';

interface DisableReason {
  readonly actor: string;
  readonly calendars?: string[];
}

interface PipelineTransitionAction {
  readonly pipelineName: string;
  readonly stageName: string;
  readonly decision: 'ENABLE' | 'DISABLE' | 'SKIP:NOT_FOUND' | 'SKIP:NO_OP' | 'SKIP:EXTERNAL_ACTOR';
  readonly disableReason?: DisableReason;
  readonly error?: string;
}

interface BakeStepApprovalProps {
  readonly pipelineName: string;
  readonly stageName: string;
  readonly actionName: string;
  readonly actionExecutionId: string;
  readonly pipelineExecutionId: string;
  readonly token: string;
}

interface BakeStepAction {
  decision: 'APPROVE' | 'REJECT' | 'CONTINUE' | 'DONE';
  actionName: string;
  rejectReasons?: string[];
  approvalProps?: BakeStepApprovalProps;
}

const codepipeline = new aws.CodePipeline();
const ssm = new aws.SSM();

const toMarkdown = (reason: DisableReason) =>
  '```\n' + JSON.stringify(reason, null, 2) + '\n```';

const getCalendarStates = async (calendarNames: string[]) => {
  const states: Record<string, string> = {};

  // query each calendar separately to better report which calendars
  // are disabling transitions
  await Promise.all(
    calendarNames.map(async (calendarName) => {
      const result = await ssm
        .getCalendarState({
          CalendarNames: [calendarName],
        })
        .promise();

      states[calendarName] = result.State!;
    }),
  );

  console.log('Calendar states', states);
  return states;
};

const transitionDisabledByEnforcer = (reason?: string) => {
  if (!reason) {
    return false;
  }

  let parsedReason: DisableReason;
  try {
    parsedReason = JSON.parse(reason.substring(3, reason.length - 3));
  } catch (err) {
    console.log('Disabled reason', reason, 'cannot be parsed:', err);
    return false;
  }

  if (!('actor' in parsedReason)) {
    console.log('Disabled reason', reason, "does not contain 'actor'");
    return false;
  }

  if (!parsedReason.actor.startsWith('DeploymentSafetyEnforcer@')) {
    console.log('Disabled reason actor', parsedReason.actor, 'is not us');
    return false;
  }

  return true;
};

interface AlarmStateQuery {
  readonly alarmName: string;
  readonly startTime: Date;
  readonly treatMissingAlarm: string;
}

const getAlarmStates = async (
  alarms: AlarmStateQuery[],
  cloudwatchClient: aws.CloudWatch,
) => {
  let results: aws.CloudWatch.DescribeAlarmsOutput;
  try {
    results = await cloudwatchClient.describeAlarms({
      AlarmNames: alarms.map((a) => a.alarmName),
      AlarmTypes: ['MetricAlarm', 'CompositeAlarm'],
    }).promise();
  } catch (err) {
    console.log('Received error while describing alarms', err);
    results = {};
  }

  const resultsLookup: Record<string, aws.CloudWatch.MetricAlarm | aws.CloudWatch.CompositeAlarm> = {};
  [
    ...(results.MetricAlarms ?? []),
    ...(results.CompositeAlarms ?? []),
  ].forEach((alarm) => resultsLookup[alarm.AlarmName!] = alarm);

  return alarms.map((alarm) => {
    if (!(alarm.alarmName in resultsLookup)) {
      console.log(`Alarm ${alarm.alarmName}: not found when describing`);
      return {
        alarm,
        state: 'MISSING',
      };
    }

    const state = resultsLookup[alarm.alarmName];
    if (state.StateValue !== 'OK') {
      console.log(`Alarm ${alarm.alarmName}: currently in state ${state.StateValue}`);
      return {
        alarm,
        state: 'IN_ALARM',
      };
    }

    if (state.StateUpdatedTimestamp && state.StateUpdatedTimestamp > alarm.startTime) {
      // while it has recovered, it went into alarm since the start of the action
      console.log(`Alarm ${alarm.alarmName}: transitioned on ${state.StateUpdatedTimestamp} > bake start ${alarm.startTime}`);
      return {
        alarm,
        state: 'IN_ALARM',
      };
    }

    console.log(`Alarm ${alarm.alarmName}: OK`);
    return {
      alarm,
      state: 'OK',
    };
  });
};

export const calculatePipelineTransitionActions = (
  pipelineState: aws.CodePipeline.GetPipelineStateOutput,
  calendarsByPipelineStage: Record<string, string[]>,
  calendarStates: Record<string, string>,
  requestId: string,
): PipelineTransitionAction[] => {
  const pipelineName = pipelineState.pipelineName!;

  return Object.entries(calendarsByPipelineStage).map(([stageName, calendars]) => {
    const stage = pipelineState.stageStates?.find((s) => s.stageName === stageName);
    if (!stage) {
      return {
        pipelineName,
        stageName,
        decision: 'SKIP:NOT_FOUND',
      };
    }

    const inboundTransitionState = stage.inboundTransitionState!;
    // Validate the disabled reason to ensure it was last performed
    // by this function. Otherwise, skip enabling.
    if (
      !inboundTransitionState.enabled
      && !transitionDisabledByEnforcer(inboundTransitionState.disabledReason)
    ) {
      return {
        pipelineName,
        stageName,
        decision: 'SKIP:EXTERNAL_ACTOR',
        error: inboundTransitionState.disabledReason,
      };
    }

    const closedCalendars = calendars.filter((calendarName) => calendarStates[calendarName] === 'CLOSED');
    if (closedCalendars.length > 0) {
      return {
        pipelineName,
        stageName,
        decision: 'DISABLE',
        disableReason: {
          actor: `DeploymentSafetyEnforcer@${requestId}`,
          calendars: closedCalendars,
        },
      };
    }

    if (inboundTransitionState.enabled) {
      return {
        pipelineName,
        stageName,
        decision: 'SKIP:NO_OP',
      };
    }

    return {
      pipelineName,
      stageName,
      decision: 'ENABLE',
    };
  });
};

const calculateBakeActions = async (
  pipelineState: aws.CodePipeline.GetPipelineStateOutput,
  bakeSteps: Record<string, BakeStepSettings>,
) => {
  const pipelineName = pipelineState.pipelineName!;
  const stageStates = pipelineState.stageStates ?? [];
  const decisions: BakeStepAction[] = [];

  // 1. determine bake steps in progress
  const inProgress: Record<string, BakeStepApprovalProps[]> = {};
  stageStates.forEach((stage) => {
    stage.actionStates!
      .filter((a) => a.actionName! in bakeSteps)
      .forEach((action) => {
        if (action.latestExecution?.status === 'InProgress') {
          const pipelineExecutionId = stage.latestExecution!.pipelineExecutionId!;
          if (!(pipelineExecutionId in inProgress)) {
            inProgress[pipelineExecutionId] = [];
          }
          inProgress[pipelineExecutionId].push({
            pipelineName,
            pipelineExecutionId,
            stageName: stage.stageName!,
            actionName: action.actionName!,
            token: action.latestExecution!.token!,
            actionExecutionId: action.latestExecution!.actionExecutionId!,
          });
        } else {
          decisions.push({
            decision: 'DONE',
            actionName: action.actionName!,
          });
        }
      });
  });

  // 2. Determine start time for in progress actions by querying action
  // executions, grouped by pipeline execution ID
  const startTimes: Record<string, Date> = {};
  await Promise.all(Object.values(inProgress).map(async (actions) => {
    const remainingActions = new Set(actions.map((a) => a.actionExecutionId));

    let nextToken: string | undefined;
    do {
      const results = await codepipeline.listActionExecutions({
        pipelineName: actions[0]!.pipelineName,
        filter: {
          pipelineExecutionId: actions[0]!.pipelineExecutionId,
        },
        nextToken,
      }).promise();

      nextToken = results.nextToken;
      remainingActions.forEach((actionExecutionId) => {
        const detail = results.actionExecutionDetails!.find((d) => d.actionExecutionId === actionExecutionId);
        if (detail) {
          startTimes[detail.actionName!] = detail.startTime!;
          remainingActions.delete(actionExecutionId);
        }
      });

      // actionExecutionDetails!.
    } while (nextToken && remainingActions.size > 0);

    if (remainingActions.size > 0) {
      throw new Error(`Unable to find start times for ${new Array(...remainingActions)}`);
    }
  }));

  // 3. decide fate of in progress based on start times
  const pendingAlarmDecision: {
    readonly approvalProps: BakeStepApprovalProps;
    readonly alarmSettings: BakeStepAlarmSettings[];
  }[] = [];

  const now = Date.now();
  await Promise.all(
    Object.values(inProgress).flatMap((props) => props).map(async (props) => {
      const bakeStep = bakeSteps[props.actionName];
      const startTime = startTimes[props.actionName];
      const endTime = startTime.getTime() + bakeStep.bakeTimeMillis;

      if (endTime < now) {
        decisions.push({
          decision: 'APPROVE',
          actionName: props.actionName,
          approvalProps: props,
        });
        return;
      }

      if ((bakeStep.alarmSettings ?? []).length > 0) {
        pendingAlarmDecision.push({
          approvalProps: props,
          alarmSettings: bakeStep.alarmSettings!,
        });
      } else {
        decisions.push({
          decision: 'CONTINUE',
          actionName: props.actionName,
        });
      }
    }),
  );

  // 4. check for alarm decisions next
  // For efficiency, group the alarm ARNs by '<region>\n<roleArn>', using special
  // placeholder value for those with no roles, so that we can use a single SDK
  // client and call for all alarms in that group.
  const NO_ROLE_PLACEHOLDER = 'NO-ROLE';
  const alarmNamesByRoleArn: Record<string, AlarmStateQuery[]> = {};
  pendingAlarmDecision.forEach(({ approvalProps, alarmSettings }) => {
    alarmSettings.forEach(({ alarmName, assumeRoleArn, treatMissingAlarm, region }) => {
      const key = `${region}\n${assumeRoleArn ?? NO_ROLE_PLACEHOLDER}`;
      if (!(key in alarmNamesByRoleArn)) {
        alarmNamesByRoleArn[key] = [];
      }
      alarmNamesByRoleArn[key].push({
        alarmName,
        treatMissingAlarm: treatMissingAlarm ?? 'REJECT',
        startTime: startTimes[approvalProps.actionName],
      });
    });
  });

  const failedAlarmsByName = new Set<string>();
  await Promise.all(
    Object.entries(alarmNamesByRoleArn).map(async ([roleArnKey, alarms]) => {
      const [region, roleArn] = roleArnKey.split('\n');
      let credentials: aws.Credentials | undefined;
      if (roleArn !== NO_ROLE_PLACEHOLDER) {
        credentials = new aws.ChainableTemporaryCredentials({
          params: {
            RoleArn: roleArn,
            RoleSessionName: 'DeploymentSafetyEnforcer',
          },
        });

      }
      const cloudwatchClient = new aws.CloudWatch({
        credentials,
        region,
      });

      const results = await getAlarmStates(alarms, cloudwatchClient);
      results.forEach(({ alarm, state }) => {
        if (state === 'IN_ALARM') {
          failedAlarmsByName.add(`${roleArn}\n${alarm.alarmName}`);
        } else if (state === 'MISSING' && alarm.treatMissingAlarm === 'REJECT') {
          failedAlarmsByName.add(`${roleArn}\n${alarm.alarmName}`);
        }
      });
    }),
  );

  pendingAlarmDecision.forEach(({ approvalProps, alarmSettings }) => {
    const failedAlarms = alarmSettings.filter(
      (alarm) => failedAlarmsByName.has(
        `${alarm.assumeRoleArn ?? NO_ROLE_PLACEHOLDER}\n${alarm.alarmName}`,
      ),
    );

    if (failedAlarms.length > 0) {
      decisions.push({
        approvalProps,
        decision: 'REJECT',
        actionName: approvalProps.actionName,
        rejectReasons: failedAlarms.map((a) => a.alarmName),
      });
    } else {
      decisions.push({
        decision: 'CONTINUE',
        actionName: approvalProps.actionName,
      });
    }
  });

  return decisions;
};

/**
 * Main logic for enforcer.
 */
const execute = async (
  settings: DeploymentSafetySettings,
  pipelineState: aws.CodePipeline.GetPipelineStateOutput,
  requestId: string,
) => {
  // 1. evaluate actions
  const { changeCalendars } = settings;
  const transitionActions = calculatePipelineTransitionActions(
    pipelineState,
    changeCalendars,
    await getCalendarStates(Object.values(changeCalendars).flatMap((s) => s)),
    requestId,
  );

  const bakeActions = await calculateBakeActions(pipelineState, settings.bakeSteps);

  // 2. perform actions in proper sequence
  console.log('Transition action summary', JSON.stringify(transitionActions));
  console.log('Bake action summary', JSON.stringify(bakeActions));

  // first: disable any transitions that should be closed to avoid pipeline
  // executions being promoted to them when other actions are approved
  await Promise.all(
    transitionActions.filter(a => a.decision === 'DISABLE').map((action) =>
      codepipeline
        .disableStageTransition({
          pipelineName: action.pipelineName,
          stageName: action.stageName,
          transitionType: 'Inbound',
          reason: toMarkdown(action.disableReason!),
        })
        .promise(),
    ),
  );

  // second: reject/approve all bake times
  await Promise.all(
    bakeActions.filter((a) => a.decision === 'REJECT').map(({ approvalProps, rejectReasons }) =>
      codepipeline.putApprovalResult({
        actionName: approvalProps!.actionName!,
        pipelineName: approvalProps!.pipelineName!,
        stageName: approvalProps!.stageName!,
        token: approvalProps!.token!,
        result: {
          status: 'Rejected',
          summary: `DeploymentSafetyEnforcer@${requestId} due to ${rejectReasons?.join(', ')}`,
        },
      }).promise(),
    ),
  );
  await Promise.all(
    bakeActions.filter((a) => a.decision === 'APPROVE').map(({ approvalProps }) =>
      codepipeline.putApprovalResult({
        actionName: approvalProps!.actionName!,
        pipelineName: approvalProps!.pipelineName!,
        stageName: approvalProps!.stageName!,
        token: approvalProps!.token!,
        result: {
          status: 'Approved',
          summary: `Approved by DeploymentSafetyEnforcer@${requestId}`,
        },
      }).promise(),
    ),
  );

  // last: enable any transitions that should be enabled
  await Promise.all(
    transitionActions.filter(a => a.decision === 'ENABLE').map((action) =>
      codepipeline
        .enableStageTransition({
          pipelineName: action.pipelineName,
          stageName: action.stageName,
          transitionType: 'Inbound',
        })
        .promise(),
    ),
  );
};

export const handler = async (
  event: DeploymentSafetySettings,
  context: Context,
) => {
  try {
    console.log('Start event', event, 'context', context);
    const pipelineState = await codepipeline
      .getPipelineState({
        name: event.pipelineName,
      })
      .promise();
    await execute(event, pipelineState, context.awsRequestId);
  } catch (error) {
    console.error(error, 'Unexpected error');
    throw error;
  } finally {
    console.log('Finished');
  }
};

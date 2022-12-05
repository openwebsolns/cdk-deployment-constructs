import { Context } from 'aws-lambda';
import * as aws from 'aws-sdk';
import { DeploymentSafetySettings } from './common';

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

const codepipeline = new aws.CodePipeline();
const ssm = new aws.SSM();

const toMarkdown = (reason: DisableReason) =>
  '```' + JSON.stringify(reason) + '```';

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

  // 2. perform actions in proper sequence
  console.log('Transition action summary', transitionActions);

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

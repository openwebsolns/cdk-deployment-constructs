import { Context } from 'aws-lambda';
import * as aws from 'aws-sdk';
import { DeploymentSafetySettings } from './common';

interface DisableReason {
  readonly actor: string;
  readonly calendars?: string[];
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

const disablePipelineTransitions = async (
  pipelineState: aws.CodePipeline.GetPipelineStateOutput,
  calendarsByPipelineStage: Record<string, string[]>,
  calendarStates: Record<string, string>,
  context: Context,
) => {
  const pipelineName = pipelineState.pipelineName!;
  const stageStates = pipelineState.stageStates!;

  console.log('Start step: disable transitions for', pipelineName);
  await Promise.all(
    (stageStates ?? []).map(async (stage) => {
      const stageName = stage.stageName!;
      const closedCalendars = (
        calendarsByPipelineStage[stageName!] ?? []
      ).filter((calendarName) => calendarStates[calendarName] === 'CLOSED');

      if (closedCalendars.length > 0) {
        console.log(
          'Disabling inbound transition for pipeline',
          pipelineName,
          'stage',
          stageName,
          'due to closed calendars',
          closedCalendars,
        );

        const reason: DisableReason = {
          actor: `DeploymentSafetyEnforcer@${context.awsRequestId}`,
          calendars: closedCalendars,
        };

        await codepipeline
          .disableStageTransition({
            pipelineName,
            stageName,
            transitionType: 'Inbound',
            reason: toMarkdown(reason),
          })
          .promise();
      }
    }),
  );
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

const enablePipelineTransitions = async (
  pipelineState: aws.CodePipeline.GetPipelineStateOutput,
  calendarsByPipelineStage: Record<string, string[]>,
  calendarStates: Record<string, string>,
) => {
  const pipelineName = pipelineState.pipelineName!;
  const stageStates = pipelineState.stageStates!;

  console.log('Start step: enabling transitions for', pipelineName);
  await Promise.all(
    (stageStates ?? []).map(async (stage) => {
      const stageName = stage.stageName!;
      const inboundTransitionState = stage.inboundTransitionState!;

      if (inboundTransitionState.enabled) {
        // nothing to do; already enabled
        return;
      }

      const closedCalendars = (
        calendarsByPipelineStage[stageName] ?? []
      ).filter((calendarName) => calendarStates[calendarName] === 'CLOSED');
      if (closedCalendars.length > 0) {
        // should not be enabled
        return;
      }

      // Validate the disabled reason to ensure it was last performed
      // by this function. Otherwise, skip enabling.
      if (
        !transitionDisabledByEnforcer(inboundTransitionState.disabledReason)
      ) {
        console.log(
          'Not enabling transition for pipeline',
          pipelineName,
          'stage',
          stageName,
          'due to non-enfrocer reason',
          inboundTransitionState,
        );
        return;
      }

      console.log(
        'Enabling inbound transition for pipeline',
        pipelineName,
        'stage',
        stageName,
      );
      await codepipeline
        .enableStageTransition({
          pipelineName,
          stageName,
          transitionType: 'Inbound',
        })
        .promise();
    }),
  );
};

const execute = async (
  settings: DeploymentSafetySettings,
  context: Context,
) => {
  const { pipelineName, changeCalendars } = settings;
  const pipelineState = await codepipeline
    .getPipelineState({
      name: pipelineName,
    })
    .promise();

  const changeCalendarNames = Object.values(changeCalendars).flatMap((s) => s);
  if (changeCalendarNames.length > 0) {
    const calendarStates = await getCalendarStates(changeCalendarNames);
    // first: disable any transitions that should be closed to avoid pipeline
    // executions being promoted to them when other actions are approved
    await disablePipelineTransitions(
      pipelineState,
      changeCalendars,
      calendarStates,
      context,
    );

    // last: enable any transitions that should be enabled
    await enablePipelineTransitions(
      pipelineState,
      changeCalendars,
      calendarStates,
    );
  }
};

export const handler = async (
  event: DeploymentSafetySettings,
  context: Context,
) => {
  try {
    console.log('Start event', event, 'context', context);
    await execute(event, context);
  } catch (error) {
    console.error(error, 'Unexpected error');
    throw error;
  } finally {
    console.log('Finished');
  }
};

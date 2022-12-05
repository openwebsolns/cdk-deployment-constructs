import * as aws from 'aws-sdk';
import * as tester from '../src/DeploymentSafetyEnforcer.function';

const TEST_PIPELINE_NAME = 'TestPipeline';
const TEST_REQUEST_ID = 'TestRequestId';

describe('calculatePipelineTransitionActions', () => {
  const pipelineState: aws.CodePipeline.GetPipelineStateOutput = {
    pipelineName: TEST_PIPELINE_NAME,
    stageStates: [
      {
        stageName: 'NotPartOfInput',
      },
      {
        stageName: 'NoCalendars::SKIP:NO_OP',
        inboundTransitionState: {
          enabled: true,
        },
      },
      {
        stageName: 'StartsOpen::DISABLE',
        inboundTransitionState: {
          enabled: true,
        },
      },
      {
        stageName: 'StartsClosed::ENABLE',
        inboundTransitionState: {
          enabled: false,
          disabledReason: '```{"actor":"DeploymentSafetyEnforcer@id"}```',
        },
      },
      {
        stageName: 'ExternallyDisabled-OpenCalendar::SKIP:EXTERNAL_ACTOR',
        inboundTransitionState: {
          enabled: false,
          disabledReason: 'Manually disabled',
        },
      },
      {
        stageName: 'ExternallyDisabled-ClosedCalendar::SKIP:EXTERNAL_ACTOR',
        inboundTransitionState: {
          enabled: false,
          disabledReason: 'Manually disabled',
        },
      },
    ],
  };

  const calendarsByPipelineStage = {
    'NoCalendars::SKIP:NO_OP': [],
    'StartsOpen::DISABLE': ['ClosedCalendar'],
    'StartsClosed::ENABLE': ['OpenCalendar'],
    'ExternallyDisabled-OpenCalendar::SKIP:EXTERNAL_ACTOR': ['OpenCalendar'],
    'ExternallyDisabled-ClosedCalendar::SKIP:EXTERNAL_ACTOR': ['ClosedCalendar'],
  };

  const calendarStates = {
    OpenCalendar: 'OPEN',
    ClosedCalendar: 'CLOSED',
  };

  const actions = tester.calculatePipelineTransitionActions(
    pipelineState,
    calendarsByPipelineStage,
    calendarStates,
    TEST_REQUEST_ID,
  );

  Object.keys(calendarsByPipelineStage).forEach((stageName) => {
    const decision = stageName.split(/::/, 2).pop();

    test(`verdict for stage ${stageName}`, () => {
      const action = actions.find((s) => s.stageName === stageName);
      expect(action).toBeDefined();
      expect(action!.decision).toEqual(decision);
      expect(action!.pipelineName).toEqual(TEST_PIPELINE_NAME);

      if (decision === 'DISABLE') {
        expect(action!.disableReason).toBeDefined();
        expect(action!.disableReason!.actor).toEqual(`DeploymentSafetyEnforcer@${TEST_REQUEST_ID}`);
      }
    });

    expect(actions.find((s) => s.stageName === 'NotPartOfInput')).toBeUndefined();
  });
});

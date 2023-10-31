import { App, Stack, Stage } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DeploymentSafetyEnforcer } from '../src/index';

class MockStage extends Stage {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new Stack(this, `Stack-${id}`);
  }
}

const mockApp = new App();
const stack = new Stack(mockApp);
const pipeline = new CodePipeline(stack, 'Pipeline', {
  selfMutation: false,
  synth: new ShellStep('Synth', {
    commands: [],
    input: CodePipelineSource.gitHub('openwebsolns/cdk-deployment-constructs', 'branchName'),
  }),
});

pipeline.addStage(new MockStage(stack, 'FirstStage'));
pipeline.addStage(new MockStage(stack, 'SecondStage'));
pipeline.buildPipeline();

const enforcer = new DeploymentSafetyEnforcer(stack, 'Test', {
  pipeline: pipeline.pipeline,
  metrics: {
    enabled: true,
    metricNamespace: 'metricNamespace',
  },
});
const template = Template.fromStack(stack);

test('Lambda functions should be configured with properties and execution roles', () => {
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs16.x',
    Timeout: 60,
  });

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
  });
});

test('Event Bridge rule should be created', () => {
  template.hasResourceProperties('AWS::Events::Rule', {
    ScheduleExpression: 'rate(10 minutes)',
  });
});

test('Lambda Integration should be created', () => {
  template.hasResourceProperties('AWS::Lambda::Permission', {
    Principal: 'events.amazonaws.com',
  });
});

test('FailedStages metric', () => {
  const metric = enforcer.metricFailedStages();
  expect(metric.metricName).toEqual('FailedStages');
  expect(metric.dimensions?.PipelineName).toBeDefined();
  expect(metric.namespace).toEqual('metricNamespace');
  expect(metric.statistic).toEqual('Average');
});

import { App, Duration, Stack, Stage } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { CodePipelineHelper } from '../src/index';

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

const tester = new CodePipelineHelper(stack, 'PipelineHelper', { pipeline });

const wave1 = pipeline.addWave('Wave1');
wave1.addStage(new MockStage(stack, 'FirstStage'), {
  post: [
    tester.newBakeStep('Bake-FirstStage', {
      bakeTime: Duration.hours(2),
    }),
  ],
});
tester.blockWaveOnChangeCalendars(wave1, ['Calendar1']);

const wave2 = pipeline.addWave('Wave2', {
  post: [
    tester.newBakeStep('Bake-Wave2', {
      bakeTime: Duration.hours(2),
    }),
  ],
});
wave2.addStage(new MockStage(stack, 'SecondStage'));
wave2.addStage(new MockStage(stack, 'ThirdStage'));
tester.blockWaveOnChangeCalendars(wave2, ['Calendar2']);

const template = Template.fromStack(stack);

test('Event Bridge rule input', () => {
  template.hasResourceProperties('AWS::Events::Rule', {
    Targets: Match.arrayWith([
      Match.objectLike({
        Input: {
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([
              Match.stringLikeRegexp('"FirstStage".+"Wave2"'),
            ]),
          ]),
        },
      }),
    ]),
  });
});

import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as common from './common';

/**
 * Props for creating a stage/wave bake approval step.
 */
export interface BakeStepProps {
  /**
   * How long to wait before approving the step.
   */
  readonly bakeTime: cdk.Duration;
}

/**
 * Properties for `DeploymentSafetyEnforcer`.
 */
export interface DeploymentSafetyEnforcerProps {
  /**
   * The pipeline to enforce.
   */
  readonly pipeline: codepipeline.Pipeline;

  /**
   * SSM Change Calendars to consult for promotions into a given stage.
   */
  readonly changeCalendars?: Record<string, string[]>;

  /**
   * Bake step configurations, indexed by manual approval action name.
   *
   * Bake steps are manual approval steps that are automatically approved
   * after a certain period of time, artificially slowing down a pipeline
   * execution in order to give time for data to arrive.
   */
  readonly bakeSteps?: Record<string, BakeStepProps>;

  /**
   * How often to run the enforcer.
   *
   * Default: 10 minutes.
   */
  readonly enforcementFrequency?: cdk.Duration;
}

/**
 * Creates a Lambda function to monitor a `CodePipeline`.
 */
export class DeploymentSafetyEnforcer extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: DeploymentSafetyEnforcerProps,
  ) {
    super(scope, id);

    const enforcerFunction = new lambdaNode.NodejsFunction(this, 'function', {
      runtime: lambda.Runtime.NODEJS_16_X,
      bundling: {
        sourceMap: true,
        externalModules: ['aws-sdk'],
        nodeModules: ['source-map-support'],
      },
      environment: {
        AWS_STS_REGIONAL_ENDPOINTS: 'regional',
      },
      timeout: cdk.Duration.minutes(1),
    });

    enforcerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['codepipeline:GetPipelineState'],
        resources: [props.pipeline.pipelineArn],
      }),
    );

    const changeCalendars = props.changeCalendars ?? {};
    if (Object.values(changeCalendars).flatMap((c) => c).length > 0) {
      enforcerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'codepipeline:DisableStageTransition',
            'codepipeline:EnableStageTransition',
          ],
          resources: [`${props.pipeline.pipelineArn}/*`],
        }),
      );

      enforcerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ssm:GetCalendarState'],
          resources: this.convertToArns(changeCalendars),
        }),
      );
    }

    const bakeSteps = props.bakeSteps ?? {};
    if (Object.keys(bakeSteps).length > 0) {
      enforcerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'codepipeline:ListActionExecutions',
            'codepipeline:PutApprovalResult',
          ],
          resources: [
            props.pipeline.pipelineArn,
            `${props.pipeline.pipelineArn}/*`,
          ],
        }),
      );
    }

    const bakeStepSettings: Record<string, common.BakeStepSettings> = {};
    Object.entries(bakeSteps).forEach(([actionName, settings]) => {
      bakeStepSettings[actionName] = {
        bakeTimeMillis: settings.bakeTime.toMilliseconds(),
      };
    });

    const input: common.DeploymentSafetySettings = {
      pipelineName: props.pipeline.pipelineName,
      changeCalendars: props.changeCalendars ?? {},
      bakeSteps: bakeStepSettings,
    };

    new events.Rule(this, 'ScheduleEnforcer', {
      schedule: events.Schedule.rate(
        props.enforcementFrequency ?? cdk.Duration.minutes(10),
      ),
      targets: [
        new targets.LambdaFunction(enforcerFunction, {
          event: events.RuleTargetInput.fromObject(input),
        }),
      ],
    });
  }

  private convertToArns(changeCalendars: Record<string, string[]>) {
    return Object.values(changeCalendars).flatMap((calendarNames) =>
      calendarNames.map((name) => {
        if (name.startsWith('arn:')) {
          return name;
        }

        // must be from this same account and region
        //  arn:${Partition}:ssm:${Region}:${Account}:document/${DocumentName}
        return cdk.Arn.format(
          {
            service: 'ssm',
            resource: 'document',
            resourceName: name,
          },
          cdk.Stack.of(this),
        );
      }),
    );
  }
}

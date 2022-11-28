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
    if (Object.keys(changeCalendars).length > 0) {
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

    const input: common.DeploymentSafetySettings = {
      pipelineName: props.pipeline.pipelineName,
      changeCalendars: props.changeCalendars ?? {},
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

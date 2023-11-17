import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as common from './common';

/**
 * Alarm to inspect in bake step.
 */
export interface BakeStepAlarmProps {
  /**
   * The name of the alarm to monitor.
   */
  readonly alarm: cloudwatch.IAlarm;

  /**
   * Role to assume in order to describe the alarm history.
   *
   * For cross-account support, first create this role in the target account
   * and add trust policy that trusts the pipeline account to assume it.
   */
  readonly assumeRole?: iam.IRole;

  /**
   * Specify approval behavior if the alarm cannot be described.
   *
   * Default: `REJECT`. Set to `IGNORE` if the alarm may not yet be created.
   * Note that failure to assume the role (if applicable) may also result in a
   * rejected approval.
   */
  readonly treatMissingAlarm?: 'IGNORE' | 'REJECT';

}

/**
 * Props for creating a stage/wave bake approval step.
 */
export interface BakeStepProps {
  /**
   * How long to wait before approving the step.
   */
  readonly bakeTime: cdk.Duration;

  /**
   * Optionally watch the given alarm and reject if it fires.
   */
  readonly rejectOnAlarms?: BakeStepAlarmProps[];
}

/**
 * Props for emitting pipeline-related metrics.
 */
export interface MetricsProps {
  /**
   * Set to true to emit metrics on pipeline with every enforcer execution.
   *
   * Default: true
   */
  readonly enabled: boolean;

  /**
   * CloudWatch namespace to use for the metrics.
   */
  readonly metricNamespace?: string;
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
   * Configuration for emitting pipeline metrics.
   */
  readonly metrics?: MetricsProps;

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
  private readonly props: DeploymentSafetyEnforcerProps;

  constructor(
    scope: Construct,
    id: string,
    props: DeploymentSafetyEnforcerProps,
  ) {
    super(scope, id);
    this.props = props;

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

      const alarmHistoryRoles = new Set<string>();
      const alarmArns = new Set<string>();
      Object.values(props.bakeSteps!)
        .flatMap((s) => s.rejectOnAlarms ?? [])
        .forEach((alarm) => {
          if (alarm.assumeRole) {
            alarmHistoryRoles.add(alarm.assumeRole.roleArn);
          } else {
            // only need explicit alarm permission if role is not provided,
            // as permissions are otherwise conferred by the role itself
            alarmArns.add(alarm.alarm.alarmArn);
          }
        });

      if (alarmHistoryRoles.size > 0) {
        enforcerFunction.addToRolePolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'sts:AssumeRole',
            ],
            resources: new Array(...alarmHistoryRoles),
          }),
        );
      }

      if (alarmArns.size > 0) {
        enforcerFunction.addToRolePolicy(
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'cloudwatch:DescribeAlarms',
            ],
            resources: ['*'], // IAM requires this level for given operation
          }),
        );
      }
    }

    if (props.metrics?.enabled !== false) {
      enforcerFunction.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cloudwatch:PutMetricData',
          ],
          resources: ['*'], // IAM requires this level for given operation
        }),
      );
    }

    const bakeStepSettings: Record<string, common.BakeStepSettings> = {};
    Object.entries(bakeSteps).forEach(([actionName, settings]) => {
      bakeStepSettings[actionName] = {
        bakeTimeMillis: settings.bakeTime.toMilliseconds(),
        alarmSettings: (settings.rejectOnAlarms ?? []).map((s) => ({
          alarmName: s.alarm.alarmName,
          region: s.alarm.alarmArn.split(':')[3],
          assumeRoleArn: s.assumeRole?.roleArn,
          treatMissingAlarm: s.treatMissingAlarm ?? 'REJECT',
        })),
      };
    });

    const input: common.DeploymentSafetySettings = {
      pipelineName: props.pipeline.pipelineName,
      changeCalendars: props.changeCalendars ?? {},
      bakeSteps: bakeStepSettings,
      metricsSettings: {
        enabled: props.metrics?.enabled !== false,
        namespace: props.metrics?.metricNamespace,
      },
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

  public metricFailedStages(props?: cloudwatch.MetricOptions) {
    return this.metric('FailedStages', props);
  }

  public metricMaxActionExecutionLatency(props?: cloudwatch.MetricOptions) {
    return this.metric('MaxActionExecutionLatency', props);
  }

  public metric(metricName: string, props?: cloudwatch.MetricOptions) {
    return new cloudwatch.Metric({
      metricName,
      namespace: this.props.metrics?.metricNamespace ?? 'DeploymentSafetyEnforcer',
      period: cdk.Duration.minutes(5),
      statistic: cloudwatch.Stats.AVERAGE,
      dimensionsMap: {
        PipelineName: this.props.pipeline.pipelineName,
      },
      ...props,
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

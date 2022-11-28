import * as cdk from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { DeploymentSafetyEnforcer } from './DeploymentSafetyEnforcer';

/**
 * Properties for `CodePipelineHelper`.
 */
export interface CodePipelineHelperProps {
  /**
   * The pipeline to monitor with this helper
   */
  readonly pipeline: pipelines.CodePipeline;

  /**
   * How often to run the enforcer.
   *
   * Default: 10 minutes.
   */
  readonly enforcementFrequency?: cdk.Duration;
}

/**
 * Properties for `CodePipelineHelper.putCalendarBlockers`
 */
export interface AddCalendarBlockersProps {
  /**
   * Stage to deploy.
   */
  readonly stage: pipelines.StageDeployment;
  /**
   * List of SSM Change Calendar names or ARNs (for shared calendars) to consult.
   *
   * Deployments into the associated stage will be blocked if _any_ of these calendars
   * are `CLOSED`; and will be enabled iff _all_ are `OPEN`.
   */
  readonly changeCalendarNames: string[];
}

/**
 * Companion construct for a (aws-codepipeline) `CodePipeline`.
 *
 * Facilitates creation of a `DeploymentSafetyEnforcer` with methods like `putCalendarBlockers`.
 * The actual enforcer is constructed (by invoking the engine) when `buildEnforcer()` is called,
 * or when `app.synth()` is called (whichever comes first).
 *
 * Example:
 *
 * ```ts
 * declare const pipeline: pipelines.CodePipeline;
 *
 * const pipelineHelper = new CodePipelineHelper(this, 'Helper', {
 *   pipeline,
 *   enforcementFrequency: Duration.minutes(5), // default: 10
 * });
 *
 * const stage = pipeline.addStage(...);
 * pipelineHelper.putCalendarBlockers({
 *   stage,
 *   changeCalendarNames: [
 *     "CalendarName",
 *     "arn:aws:ssm:$region:$account:document/CalendarArn", // for shared calendars
 *   ],
 * });
 * ```
 */
export class CodePipelineHelper extends Construct {
  /**
   * The associated pipeline.
   */
  public readonly pipeline: pipelines.CodePipeline;

  private readonly enforcementFrequency?: cdk.Duration;

  /**
   * SSM Change Calendars to consult for promotions into a given stage.
   */
  private readonly changeCalendarsByStageName: Record<string, string[]>;

  private built = false;

  constructor(scope: Construct, id: string, props: CodePipelineHelperProps) {
    super(scope, id);

    this.pipeline = props.pipeline;
    this.enforcementFrequency = props.enforcementFrequency;
    this.changeCalendarsByStageName = {};

    // delay building until all data has been collected
    cdk.Aspects.of(this).add({ visit: () => this.buildJustInTime() });
  }

  /**
   * Adds or updates Change Calendar blockers for a given stage.
   *
   * Returns self for chaining.
   */
  public putCalendarBlockers(props: AddCalendarBlockersProps) {
    this.changeCalendarsByStageName[props.stage.stageName] =
      props.changeCalendarNames;
    return this;
  }

  public buildEnforcer() {
    if (this.built) {
      throw new Error('build() has already been called: can only call it once');
    }
    this.doBuild();
    this.built = true;
  }

  private doBuild() {
    new DeploymentSafetyEnforcer(this, 'Enforcer', {
      pipeline: this.pipeline.pipeline,
      changeCalendars: this.changeCalendarsByStageName,
      enforcementFrequency: this.enforcementFrequency,
    });
  }

  private buildJustInTime() {
    if (!this.built) {
      this.buildEnforcer();
    }
  }
}

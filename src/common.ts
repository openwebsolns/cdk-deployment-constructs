export interface BakeStepAlarmSettings {
  /**
   * The name of the alarm to monitor.
   */
  readonly alarmName: string;

  /**
   * Role to assume in order to describe the alarm history.
   *
   * For cross-account support, first create this role in the target account
   * and add trust policy that trusts the pipeline account to assume it.
   */
  readonly assumeRoleArn?: string;

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
 * Settings for `CodePipelineHelper.newBakeStep`.
 */
export interface BakeStepSettings {
  /**
   * How long to wait before approving the step.
   */
  readonly bakeTimeMillis: number;

  /**
   * Optionally watch the given alarm and reject if it fires.
   */
  readonly alarmSettings?: BakeStepAlarmSettings;
}

export interface DeploymentSafetySettings {
  /**
   * Name of the CodePipeline associated with the settings.
   */
  readonly pipelineName: string;

  /**
   * List of SSM Change Calendar name or ARNs to consult, indexed by stage name
   */
  readonly changeCalendars: Record<string, string[]>;

  /**
   * Bake time steps indexed by unique action name.
   */
  readonly bakeSteps: Record<string, BakeStepSettings>;
}

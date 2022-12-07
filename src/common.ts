/**
 * Settings for `CodePipelineHelper.newBakeStep`.
 */
export interface BakeStepSettings {
  /**
   * How long to wait before approving the step.
   */
  readonly bakeTimeMillis: number;
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

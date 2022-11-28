export interface DeploymentSafetySettings {
  /**
   * Name of the CodePipeline associated with the settings.
   */
  readonly pipelineName: string;

  /**
   * List of SSM Change Calendar name or ARNs to consult, indexed by stage name
   */
  readonly changeCalendars: Record<string, string[]>;
}

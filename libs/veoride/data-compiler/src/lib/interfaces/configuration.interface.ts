export interface VeorideDataCompilerConfiguration {
  /**
   * System path where the data sets will be streamed and saved to.
   */
  exportLocation: string;

  /**
   * Interval to check for new data requests, in seconds.
   */
  checkInterval: number;

  /**
   * Threshold for old data requests files that should be removed from disk.
   */
  staleThreshold: number;
}

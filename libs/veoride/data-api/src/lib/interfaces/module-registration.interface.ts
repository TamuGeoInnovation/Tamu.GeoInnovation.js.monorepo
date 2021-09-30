export interface VeorideModuleRegistrationOptions {
  jwt: {
    secret: string;
  };

  /**
   * Used to describe app storage settings
   */
  storage: {
    /**
     * Describes the directory location of the compiled datasets.
     */
    datasets: string;
  };
}

// Injection token for datasets storage provider
export const DATASETS_STORE = 'DATASETS_STORE';

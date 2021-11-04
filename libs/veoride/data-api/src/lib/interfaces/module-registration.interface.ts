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

  /**
   * API root URL. This is necessary because the self url discovery is not reliable when the application is
   * reverse proxied through another web server.
   */
  baseUrl: string;
}

// Injection token for datasets storage provider
export const DATASETS_STORE = 'DATASETS_STORE';
export const BASE_URL = 'BASE_URL';

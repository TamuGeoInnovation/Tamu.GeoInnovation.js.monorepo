export interface AuthOptions {
  /**
   * Authentication API url
   */
  url: string;

  /**
   * Attaches a return url parameter to the redirect URL that will be used by the TAMU GISC IDP as a return URL.
   */
  attach_href?: boolean;
}

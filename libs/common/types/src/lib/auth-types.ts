/**
 * Options for the legacy session sign-in (`LegacyAuthService` in `@tamu-gisc/common/ngx/auth`). Moved here from
 * `libs/oidc/client` (#2155), so a front end can name it without compiling that server-side library.
 */
export interface AuthOptions {
  /**
   * Authentication API url
   */
  url: string;

  /**
   * Attaches a return url parameter to the redirect URL, used by the sign-in server as a return URL.
   */
  attach_href?: boolean;
}

/**
 * Authentication API url. For additional authentication options, use `AuthOptions` instead
 */
export type AuthUrl = string;

/**
 * @jest-environment-options {"url": "https://gisday.tamu.edu/sessions"}
 */
import { accessTokenUrls, api_url, auth0 } from './environment';

/**
 * #2088. The site called the API at one fixed address, `https://txgisday.org/api`, from every address it is served at, so
 * each other address (gisday.tamu.edu, tamu.txgisday.org) made cross-origin calls that worked only while it was listed
 * in the API's `ORIGINS`; tamu.txgisday.org went live unlisted and showed no data (#2087). Every address's ingress
 * already sends `/api/` to the same API, so the page now calls it on the address it was opened on. This file opens the
 * page on gisday.tamu.edu, one of the addresses that shares txgisday.org's deployment.
 */
describe("the API, on the page's own address", () => {
  /** A deployed build: its container filled in the Auth0 settings when it started. */
  const deployed = accessTokenUrls('txgisday.us.auth0.com', api_url);
  /** main.ts's interceptor sends the signed-in user's access token with a call only when this says so. */
  const sendsToken = (urls: Array<string>, url: string) => urls.some((u) => url.startsWith(u));

  it('is called on the address the page was opened on', () => {
    expect(api_url).toBe('https://gisday.tamu.edu/api');
  });

  it('gets the access token with a signed-in call on that address', () => {
    expect(sendsToken(deployed, `${api_url}/seasons/active`)).toBe(true);
  });

  it('never sends the token to another address', () => {
    expect(sendsToken(deployed, 'https://txgisday.org/api/seasons/active')).toBe(false);
    expect(sendsToken(deployed, 'https://gisday.tamu.edu.example.org/api/seasons/active')).toBe(false);
  });

  // PR 3304's GIS Day E2E: a build whose Auth0 settings were never filled in (the E2E's dev server) asked Auth0's
  // placeholder host for a token before every API call, and the calls waited on it until the tests gave up.
  it('asks for no token while the Auth0 settings are not filled in', () => {
    expect(auth0.urls).toEqual([]);
    expect(accessTokenUrls('___ANGULAR_AUTH0_DOMAIN___', api_url)).toEqual([]);
  });
});

/**
 * @jest-environment-options {"url": "https://gisday.tamu.edu/sessions"}
 */
import { api_url, auth0 } from './environment';

/**
 * #2088. The site called the API at one fixed address, `https://txgisday.org/api`, from every address it is served at, so
 * each other address (gisday.tamu.edu, tamu.txgisday.org) made cross-origin calls that worked only while it was listed
 * in the API's `ORIGINS`; tamu.txgisday.org went live unlisted and showed no data (#2087). Every address's ingress
 * already sends `/api/` to the same API, so the page now calls it on the address it was opened on. This file opens the
 * page on gisday.tamu.edu, one of the addresses that shares txgisday.org's deployment.
 */
describe("the API, on the page's own address", () => {
  /** main.ts's interceptor sends the signed-in user's access token with a call only when this says so. */
  const sendsToken = (url: string) => auth0.urls.some((u) => url.startsWith(u));

  it('is called on the address the page was opened on', () => {
    expect(api_url).toBe('https://gisday.tamu.edu/api');
  });

  it('gets the access token with a signed-in call on that address', () => {
    expect(sendsToken(`${api_url}/seasons/active`)).toBe(true);
  });

  it('never sends the token to another address', () => {
    expect(sendsToken('https://txgisday.org/api/seasons/active')).toBe(false);
    expect(sendsToken('https://gisday.tamu.edu.example.org/api/seasons/active')).toBe(false);
  });
});

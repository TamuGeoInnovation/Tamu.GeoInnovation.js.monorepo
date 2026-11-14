/**
 * Which GIS Day site a request came from, and how an email from that site is signed (#2951, #2957). Shared by every
 * email the API sends for a site: the speaker profile email and the submission review email.
 */

/**
 * The site a page is on, by host name. Every site calls the API at txgisday.org's address, so the API's own
 * host says nothing about which site a page is on; the browser's Origin does (#2951). Then a proxy's forwarded host, then
 * the request's own. `gisdaySite()` turns it into a site, and any host it does not know into the deployment's own site.
 */
export function siteHost(headers: Record<string, string | Array<string> | undefined> = {}): string | undefined {
  const first = (value: string | Array<string> | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.split(',')[0].trim();
  const origin = first(headers['origin']);

  if (origin) {
    try {
      return new URL(origin).hostname;
    } catch {
      // Not an address; fall through to the hosts.
    }
  }

  return (first(headers['x-forwarded-host']) ?? first(headers['host']))?.replace(/:\d+$/, '') || undefined;
}

/**
 * The configured sender's address under the site's own name, so an email sent from Texas A&M's site comes from "Texas A&M
 * GIS Day" (#2951). `MAILROOM_FROM` is one setting for every site, as "Name <address>" or a bare address.
 */
export function senderAs(siteName: string, configured: string | undefined): string | undefined {
  const address = configured?.match(/<([^>]+)>/)?.[1] ?? configured?.trim();

  return address ? `"${siteName.replace(/"/g, '')}" <${address}>` : configured;
}

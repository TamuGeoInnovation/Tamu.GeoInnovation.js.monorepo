/**
 * Writes one page per GIS Day site into the built app, and the list nginx picks them by (#2649).
 *
 * Link previews never run the app, so each site's page has to carry its own name, description and image. This runs
 * after the Angular build: for every site in GISDAY_SITES it writes `index.<site>.html`, the built page with that site's
 * head, and it rewrites `index.html` as txgisday.org's. It then fills the `# site pages` line in the built nginx.conf
 * with a `map` from each site's addresses to its page.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { GISDAY_SITES, GisdaySite, withSiteHead } from '@tamu-gisc/gisday/common';

const dist = process.argv[2] ?? 'dist/apps/gisday-angular';
const page = readFileSync(join(dist, 'index.html'), 'utf8');
const sites = Object.entries(GISDAY_SITES) as Array<[string, GisdaySite]>;
const hosts: Array<string> = [];

for (const [key, site] of sites) {
  writeFileSync(join(dist, `index.${key}.html`), withSiteHead(page, site));

  for (const host of [new URL(site.address).host, ...(site.hosts ?? [])]) {
    if (key !== 'txgisday' && !hosts.some((line) => line.startsWith(`${host} `))) {
      hosts.push(`${host} /index.${key}.html;`);
    }
  }
}

writeFileSync(join(dist, 'index.html'), withSiteHead(page, GISDAY_SITES.txgisday));

const confPath = join(dist, '.nginx', 'nginx.conf');
const conf = readFileSync(confPath, 'utf8');
const marker = '    # site pages';

if (!conf.includes(marker)) {
  throw new Error(`${confPath} has no "${marker.trim()}" line to put the site pages in.`);
}

writeFileSync(confPath, conf.replace(marker, hosts.map((line) => `    ${line}`).join('\n')));
console.log(`Wrote ${sites.length} site pages: ${sites.map(([key]) => `index.${key}.html`).join(', ')}.`);

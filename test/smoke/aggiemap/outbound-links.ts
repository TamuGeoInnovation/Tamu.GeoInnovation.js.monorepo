import * as fs from 'fs';
import * as path from 'path';

import { Page } from '@playwright/test';

import { DEFINITIONS_DIR, REPO_ROOT } from './definitions';

/**
 * The maps' links to other people's websites, and how to tell whether one still works (#3285).
 *
 * #3278's dead commencement link was found by Transportation Services, not by us: a link is configuration, so a map
 * with a dead one loads, draws and passes every other check. A plain status-code check is no answer either. It called
 * three of twelve working TAMU links broken: two sites 404 an extensionless path for a non-browser client, Code Maroon
 * refuses an unfamiliar user agent, and one origin reported its own refusal as a 404 with a storage error for a body.
 * So a link is loaded as a browser loads it, and judged by the page as well as the status, with every case that cannot
 * be judged reported as inconclusive rather than red. The rules are #3285's.
 */

/** One outbound link, and where the repository writes it. */
export interface OutboundLink {
  url: string;
  /** The files it is written in, relative to the repository's root. */
  from: Array<string>;
}

/** What loading a link gave: its final address, status, the page's title and text, or why it did not load. */
export interface LinkLoad {
  url: string;
  finalUrl?: string;
  status?: number;
  title?: string;
  text?: string;
  error?: string;
}

export type LinkVerdict = 'pass' | 'fail' | 'inconclusive';

export interface JudgedLink {
  verdict: LinkVerdict;
  reason: string;
  finalUrl?: string;
}

/** Where the application's own outbound links are written: its templates and its code. */
const APP_DIRS = ['libs/aggiemap', 'libs/maps/feature'];

/**
 * Addresses in the code that are not links a visitor follows: GIS services and APIs the app calls, its own site,
 * placeholders in tests and examples, XML namespaces, and a feed's saved copy.
 */
const NOT_A_LINK = [
  /\/arcgis\/rest\//i,
  /\/api\//,
  /\$\{/,
  /:\/\/(api\.|gis\.|gis-dev\.|gis\.dev\.|arc\.ts\.)/,
  /:\/\/([a-z0-9-]+\.)?aggiemap\.tamu\.edu/,
  /example\.(com|org|edu)/,
  /w3\.org/,
  /localhost/
];

/** Files whose addresses are not links: tests, and the saved copy of the Code Maroon feed. */
const NOT_A_LINK_FILE = /(\.spec\.ts|\.snapshot\.ts|\.test\.ts)$/;

/** Every `scheduleUrl` an event definition gives, one or a list. */
export function scheduleUrls(source: string): Array<string> {
  const match = /scheduleUrl:\s*(\[[^\]]*\]|'[^']*'|"[^"]*"|`[^`]*`)/.exec(source);

  if (!match) {
    return [];
  }

  return [...match[1].matchAll(/['"`](https?:\/\/[^'"`\s]+)['"`]/g)].map((m) => m[1]);
}

/** The outbound addresses written in one of the application's files: a template's `href`s, or its code's strings. */
export function addressesIn(file: string, source: string): Array<string> {
  const found = file.endsWith('.html')
    ? [...source.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'))
    : [...source.matchAll(/['"`](https?:\/\/[^'"`\s]+)['"`]/g)].map((m) => m[1]);

  return found.filter((url) => !NOT_A_LINK.some((pattern) => pattern.test(url)));
}

function filesUnder(dir: string, matches: RegExp): Array<string> {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : filesUnder(full, matches);
    }

    return matches.test(entry.name) ? [full] : [];
  });
}

/**
 * Every outbound link, collected from where it is written rather than listed by hand, so a new map's link is checked
 * the day it is added: each event definition's `scheduleUrl` (#3278's), and the application's own links in its
 * templates and code. One entry per address, with each file it is written in.
 */
export function outboundLinks(): Array<OutboundLink> {
  const links = new Map<string, Set<string>>();
  const add = (url: string, file: string) =>
    links.set(url, (links.get(url) ?? new Set()).add(path.relative(REPO_ROOT, file).split(path.sep).join('/')));

  for (const file of filesUnder(DEFINITIONS_DIR, /\.definitions\.ts$/)) {
    scheduleUrls(fs.readFileSync(file, 'utf8')).forEach((url) => add(url, file));
  }

  for (const dir of APP_DIRS) {
    for (const file of filesUnder(path.join(REPO_ROOT, dir), /\.(html|ts)$/)) {
      if (!NOT_A_LINK_FILE.test(file)) {
        addressesIn(file, fs.readFileSync(file, 'utf8')).forEach((url) => add(url, file));
      }
    }
  }

  return [...links.entries()]
    .map(([url, from]) => ({ url, from: [...from].sort() }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** A page that says it is not there, though it may answer 200: a site's own "Page Not Found". */
const NOT_FOUND = /page not found|page cannot be found|page could not be found|404 not found|^404\b|doesn.t exist/i;

/**
 * What an origin sends in place of its own page when it refused or failed and mislabelled it (#3285's comment): a
 * storage bucket's XML error, or next to nothing.
 */
const STORAGE_ERROR = /<Error>|NoSuchKey|AccessDenied|The specified key does not exist/;

/**
 * Whether one load of a link shows it working (#3285):
 *
 * - **Inconclusive**, never red: it did not load (a timeout, a refused connection), it was refused (401, 403, 429), or
 *   it answered 404 with a storage error or next to nothing for a body, which is an origin mislabelling its own refusal.
 * - **Fail**: a 404 or 410 with a real page, a server error, or a page that says it is not found whatever its status.
 * - **Pass**: anything else that loads, a redirect included, with where it landed.
 */
export function judgeLoad(load: LinkLoad): JudgedLink {
  const finalUrl = load.finalUrl;
  const moved = finalUrl && finalUrl.replace(/\/$/, '') !== load.url.replace(/\/$/, '') ? ` (lands on ${finalUrl})` : '';

  if (load.error || load.status === undefined) {
    return { verdict: 'inconclusive', reason: `did not load: ${load.error ?? 'no answer'}`, finalUrl };
  }

  if ([401, 403, 429].includes(load.status)) {
    return { verdict: 'inconclusive', reason: `refused, ${load.status}${moved}`, finalUrl };
  }

  const body = `${load.text ?? ''}`.trim();

  if (load.status === 404 || load.status === 410) {
    if (STORAGE_ERROR.test(body) || body.length < 40) {
      return {
        verdict: 'inconclusive',
        reason: `${load.status} with ${body.length < 40 ? 'next to no page' : 'a storage error for a page'}: the origin may have mislabelled a refusal${moved}`,
        finalUrl
      };
    }

    return { verdict: 'fail', reason: `${load.status}: ${load.title || 'its page says it is not there'}${moved}`, finalUrl };
  }

  if (load.status >= 500) {
    return { verdict: 'fail', reason: `server error, ${load.status}${moved}`, finalUrl };
  }

  if (NOT_FOUND.test(load.title ?? '') || NOT_FOUND.test(body.slice(0, 300))) {
    return {
      verdict: 'fail',
      reason: `${load.status}, but the page says it is not found: "${load.title}"${moved}`,
      finalUrl
    };
  }

  return { verdict: 'pass', reason: `${load.status}${moved}`, finalUrl };
}

/**
 * Loads a link as a browser does and judges it. The page's context should carry a normal browser identity
 * (`BROWSER_IDENTITY`): Playwright's own headless one is refused by at least one TAMU site the maps link to.
 */
export async function checkLink(page: Page, url: string): Promise<JudgedLink> {
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const text = await page
      .locator('body')
      .innerText({ timeout: 5_000 })
      .catch(async () => (await response?.text().catch(() => '')) ?? '');

    return judgeLoad({
      url,
      finalUrl: page.url(),
      status: response?.status(),
      title: await page.title().catch(() => ''),
      text
    });
  } catch (error) {
    return judgeLoad({ url, error: String((error as Error)?.message ?? error).split('\n')[0] });
  }
}

/** A desktop Chrome's identity, which the sites the maps link to all serve (#3285's comment). */
export const BROWSER_IDENTITY = {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' }
};

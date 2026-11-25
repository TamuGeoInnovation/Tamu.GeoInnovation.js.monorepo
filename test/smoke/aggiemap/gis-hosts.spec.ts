import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from '@playwright/test';

import { gisHostFor, isDevelopmentHostname, isDevelopmentUrl, smokeBaseUrl } from './gis-hosts';

/**
 * The host rule's own checks (#1483).
 *
 * Pure: no browser, no environment, so they run in milliseconds. A check that quietly matches
 * nothing is worse than no check - it reports green for the thing it was added to catch - so the
 * pattern is proven to catch a development host and to leave a production one alone.
 */
test.describe('telling a development GIS host from a production one', () => {
  const development = [
    'gis-dev.it.tamu.edu',
    'arc.ts-dev.tamu.edu',
    'dev.aggiemap.tamu.edu',
    'dev.gsvcs.lan',
    'something-dev'
  ];

  const production = [
    'gis.it.tamu.edu',
    'gis.tamu.edu',
    'arc.ts.tamu.edu',
    'aggiemap.tamu.edu',
    'localhost',
    '127.0.0.1'
  ];

  for (const hostname of development) {
    test(`${hostname} is a development host`, () => {
      expect(isDevelopmentHostname(hostname)).toBe(true);
    });
  }

  for (const hostname of production) {
    test(`${hostname} is not a development host`, () => {
      expect(isDevelopmentHostname(hostname)).toBe(false);
    });
  }

  test('a host that merely starts with those letters is not one', () => {
    // A substring test would match these and fail a run over a host that is nothing to do with us.
    expect(isDevelopmentHostname('devices.example.com')).toBe(false);
    expect(isDevelopmentHostname('developer.mozilla.org')).toBe(false);
  });

  test('judges a request by its host, not by the rest of the URL', () => {
    expect(isDevelopmentUrl('https://gis-dev.it.tamu.edu/arcgis/rest/services/x/MapServer')).toBe(true);
    expect(isDevelopmentUrl('https://gis.tamu.edu/arcgis/rest/services/dev/MapServer')).toBe(false);
    expect(isDevelopmentUrl('https://aggiemap.tamu.edu/assets/dev-notes.json')).toBe(false);
  });

  test('a URL that will not parse is not evidence of a development host', () => {
    expect(isDevelopmentUrl('data:image/png;base64,AAAA')).toBe(false);
    expect(isDevelopmentUrl('not a url')).toBe(false);
  });

  test('only a development environment is exempt from the rule', () => {
    expect(isDevelopmentUrl('https://dev.aggiemap.tamu.edu')).toBe(true);
    expect(isDevelopmentUrl('https://aggiemap.tamu.edu')).toBe(false);
    // A local run reaches the production GIS host, so the rule applies to it too.
    expect(isDevelopmentUrl('http://localhost:4200')).toBe(false);
    expect(isDevelopmentUrl('http://127.0.0.1:4200')).toBe(false);
  });
});

test.describe('which GIS host an environment is on (#2604)', () => {
  test('a development environment is on the development GIS host, any other on production', () => {
    expect(gisHostFor('https://dev.aggiemap.tamu.edu')).toBe('gis-dev.it.tamu.edu');
    expect(gisHostFor('https://aggiemap.tamu.edu')).toBe('gis.it.tamu.edu');
    expect(gisHostFor('http://localhost:4200')).toBe('gis.it.tamu.edu');
  });

  test('a hostname that merely contains "dev" is on production', () => {
    // The four specs that tested `hostname.includes('dev')` put these on the development host.
    expect(gisHostFor('https://devices.example.com')).toBe('gis.it.tamu.edu');
    expect(gisHostFor('https://developer.aggiemap.tamu.edu')).toBe('gis.it.tamu.edu');
    expect(gisHostFor('https://aggiemap-devotion.tamu.edu')).toBe('gis.it.tamu.edu');
  });

  test('a trailing slash does not change the host', () => {
    expect(gisHostFor('https://dev.aggiemap.tamu.edu/')).toBe('gis-dev.it.tamu.edu');
    expect(gisHostFor('https://aggiemap.tamu.edu/')).toBe('gis.it.tamu.edu');
  });
});

test.describe('the base URL every spec reads (#2604)', () => {
  test('defaults to production when nothing is set', () => {
    expect(smokeBaseUrl({})).toBe('https://aggiemap.tamu.edu');
    expect(smokeBaseUrl({ AGGIEMAP_SMOKE_BASE_URL: '' })).toBe('https://aggiemap.tamu.edu');
  });

  test('is the same with or without trailing slashes or surrounding space', () => {
    for (const given of [
      'https://dev.aggiemap.tamu.edu',
      'https://dev.aggiemap.tamu.edu/',
      'https://dev.aggiemap.tamu.edu//',
      ' https://dev.aggiemap.tamu.edu/ '
    ]) {
      expect(smokeBaseUrl({ AGGIEMAP_SMOKE_BASE_URL: given }), given).toBe('https://dev.aggiemap.tamu.edu');
    }
  });

  test('keeps a port and a path', () => {
    expect(smokeBaseUrl({ AGGIEMAP_SMOKE_BASE_URL: 'http://localhost:4200/' })).toBe('http://localhost:4200');
  });

  // Behaviour cannot show that every spec asks the same way; the source can. This is what let nine specs
  // keep a trailing slash while six stripped it, and four test `includes('dev')`.
  test('no other file reads the environment variable or tests for "dev" itself', () => {
    const here = __dirname;
    const offenders: string[] = [];

    for (const file of readdirSync(here).filter((name) => name.endsWith('.ts'))) {
      if (file === 'gis-hosts.ts' || file === 'gis-hosts.spec.ts') {
        continue;
      }

      const source = readFileSync(join(here, file), 'utf8');

      if (source.includes('AGGIEMAP_SMOKE_BASE_URL')) {
        offenders.push(`${file}: reads AGGIEMAP_SMOKE_BASE_URL`);
      }

      if (/includes\(\s*['"]dev['"]\s*\)/.test(source)) {
        offenders.push(`${file}: tests a hostname with includes('dev')`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

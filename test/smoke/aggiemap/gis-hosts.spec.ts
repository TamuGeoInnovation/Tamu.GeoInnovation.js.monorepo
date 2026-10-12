import { expect, test } from '@playwright/test';

import { environmentIsDevelopment, isDevelopmentHostRequest, isDevelopmentHostname } from './gis-hosts';

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
    expect(isDevelopmentHostRequest('https://gis-dev.it.tamu.edu/arcgis/rest/services/x/MapServer')).toBe(true);
    expect(isDevelopmentHostRequest('https://gis.tamu.edu/arcgis/rest/services/dev/MapServer')).toBe(false);
    expect(isDevelopmentHostRequest('https://aggiemap.tamu.edu/assets/dev-notes.json')).toBe(false);
  });

  test('a URL that will not parse is not evidence of a development host', () => {
    expect(isDevelopmentHostRequest('data:image/png;base64,AAAA')).toBe(false);
    expect(isDevelopmentHostRequest('not a url')).toBe(false);
  });

  test('only a development environment is exempt from the rule', () => {
    expect(environmentIsDevelopment('https://dev.aggiemap.tamu.edu')).toBe(true);
    expect(environmentIsDevelopment('https://aggiemap.tamu.edu')).toBe(false);
    // A local run reaches the production GIS host, so the rule applies to it too.
    expect(environmentIsDevelopment('http://localhost:4200')).toBe(false);
    expect(environmentIsDevelopment('http://127.0.0.1:4200')).toBe(false);
  });
});

import { expect, test } from '@playwright/test';

import { definedMaps } from './definitions';
import { ALWAYS_RUN_TITLES, grepFor, scopeForChangedFiles } from './scope';

/**
 * The scoped smoke run's own checks (#1427).
 *
 * Pure: no browser, no environment. They run in milliseconds and are part of the always-run set,
 * because a fault here does not fail loudly - it quietly runs fewer tests than it should, which is
 * the one way a tool like this can do harm.
 */

const DEFINITIONS = 'libs/ts/events/ngx/src/lib/definitions/';

const sources: Record<string, string> = {
  // Double-quoted name, because of the apostrophe. A pattern that only accepted single quotes
  // missed both basketball maps entirely (#1427).
  'mens-basketball.definitions.ts': `
    export const MensBasketball_Configuration: EventConfiguration = {
      id: 'mens-basketball',
      name: "Men's Basketball",
      discover: { type: 'event' }
    };
  `,
  '4h-roundup.definitions.ts': `
    export const Roundup_Configuration: EventConfiguration = {
      id: '4h-roundup-2026',
      name: '4-H Roundup',
      discover: { type: 'event' }
    };
  `,
  'move-in.definitions.ts': `
    export const MoveIn_Configuration: EventConfiguration = {
      id: 'move-in',
      name: 'Move-In',
      discover: { type: 'parking' }
    };
  `,
  'symbols.definitions.ts': `export const SOME_SYMBOL = 'not a map';`
};

const read = (file: string) => {
  const source = sources[file];

  if (source === undefined) {
    throw new Error(`the test has no source for ${file}`);
  }

  return source;
};

test.describe('choosing what a change needs tested', () => {
  test('maps a changed event definition to its own route', () => {
    const scope = scopeForChangedFiles([`${DEFINITIONS}mens-basketball.definitions.ts`], read);

    expect(scope.scopable).toBe(true);
    expect(scope.routes).toEqual(['/events/mens-basketball']);
  });

  test("takes the route from the definition's declared id, not from the file name", () => {
    // 4h-roundup.definitions.ts declares `4h-roundup-2026`. Deriving the route from the file name
    // would produce /events/4h-roundup, which matches no test, so the change would appear to need
    // no testing at all. This is the failure the whole module is shaped to avoid.
    const scope = scopeForChangedFiles([`${DEFINITIONS}4h-roundup.definitions.ts`], read);

    expect(scope.routes).toEqual(['/events/4h-roundup-2026']);
  });

  test("uses the discover type's section, so a parking map is not filed under events", () => {
    const scope = scopeForChangedFiles([`${DEFINITIONS}move-in.definitions.ts`], read);

    expect(scope.routes).toEqual(['/parking/move-in']);
  });

  test('runs everything when something changed that it cannot map', () => {
    const scope = scopeForChangedFiles(
      [`${DEFINITIONS}mens-basketball.definitions.ts`, 'libs/maps/esri/src/lib/esri-runtime.ts'],
      read
    );

    expect(scope.scopable).toBe(false);
    expect(scope.routes).toEqual([]);
    expect(scope.reason).toContain('esri-runtime.ts');
  });

  test('runs everything when a definition file declares no configuration', () => {
    const scope = scopeForChangedFiles([`${DEFINITIONS}symbols.definitions.ts`], read);

    expect(scope.scopable).toBe(false);
    expect(scope.reason).toContain('EventConfiguration');
  });

  test('runs everything when nothing changed, rather than nothing', () => {
    const scope = scopeForChangedFiles([], read);

    expect(scope.scopable).toBe(false);
  });

  test('needs only the always-run checks for a documentation change', () => {
    const scope = scopeForChangedFiles(['docs/releases/unreleased.md', 'README.md'], read);

    expect(scope.scopable).toBe(true);
    expect(scope.routes).toEqual([]);
  });

  test('keeps the always-run titles in the pattern, so the coverage floor is never filtered out', () => {
    const scope = scopeForChangedFiles([`${DEFINITIONS}mens-basketball.definitions.ts`], read);
    const grep = grepFor(scope);

    expect(grep).toContain('/events/mens-basketball');

    for (const title of ALWAYS_RUN_TITLES) {
      expect(grep).toContain(title);
    }
  });

  test('every real definition that declares a map yields a route', () => {
    const maps = definedMaps();

    expect(maps.length).toBeGreaterThan(40);

    for (const map of maps) {
      expect(map.route, `${map.file} produced no usable route`).toMatch(
        /^\/(events|parking|operations|campus|kiosk)\/[a-z0-9-]+$/
      );
    }
  });
});

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import { CORS_METHODS } from './cors-methods';

/** Every TypeScript file under `dir`, specs aside. */
function sources(dir: string): Array<string> {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) {
      return name === 'node_modules' ? [] : sources(path);
    }

    return name.endsWith('.ts') && !name.endsWith('.spec.ts') ? [path] : [];
  });
}

/**
 * A route whose method the API's CORS settings leave out is blocked by the browser before it is sent, with nothing in the
 * API's log: judging's PUT routes on production, 17 November 2026. The API serves the GIS Day platform's and the
 * competitions' controllers.
 */
describe('CORS_METHODS', () => {
  const root = join(__dirname, '../../../..');
  const controllers = ['libs/gisday/platform/data-api/src', 'libs/gisday/competitions/data-api/src', 'apps/gisday-nest/src']
    .flatMap((dir) => sources(join(root, dir)))
    .filter((path) => readFileSync(path, 'utf8').includes('@Controller('));

  it('finds the controllers it checks', () => {
    expect(controllers.length).toBeGreaterThan(10);
  });

  it('allows every method a controller uses', () => {
    const used = new Set(
      controllers.flatMap((path) =>
        [...readFileSync(path, 'utf8').matchAll(/@(Get|Post|Put|Patch|Delete)\(/g)].map((m) => m[1].toUpperCase())
      )
    );

    expect([...used].filter((method) => !CORS_METHODS.includes(method))).toEqual([]);
  });
});

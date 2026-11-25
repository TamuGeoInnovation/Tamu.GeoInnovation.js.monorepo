import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { PATH_METADATA } from '@nestjs/common/constants';

/**
 * #3101: every permission a GIS Day API route asks for is one the Auth0 API defines. On 12 and 15 November two
 * dashboards answered every admin 403, because their routes asked for read:rsvps and read:checkins and nobody had
 * defined them on the Auth0 API, so no token could carry them.
 *
 * The list compared against is `scripts/gisday-auth0-dev.ps1`'s, which builds the development tenant with every
 * permission the site uses. Production's Auth0 API is not in the repository; whoever adds a permission here adds it there
 * too, and this test is what reminds them.
 */
const ROOT = resolve(__dirname, '../../../../../../..');
const LIBRARIES = ['libs/gisday/platform/data-api/src', 'libs/gisday/competitions/data-api/src'];

function controllerFiles(dir: string): Array<string> {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    if (statSync(path).isDirectory()) {
      return controllerFiles(path);
    }

    return name.endsWith('.controller.ts') ? [path] : [];
  });
}

/**
 * Every permission a route of these libraries asks for, with where. Each controller is imported rather than required, so
 * the test runner compiles it, decorators included; Node's own `require` cannot read TypeScript (#1977).
 */
async function routePermissions(): Promise<Array<{ permission: string; route: string }>> {
  const files = LIBRARIES.flatMap((library) => controllerFiles(join(ROOT, library)));
  const modules = await Promise.all(files.map(async (file) => (await import(file)) as Record<string, unknown>));

  return modules.flatMap((module) =>
    Object.values(module)
      .filter(
        (value): value is { name: string; prototype: object } =>
          typeof value === 'function' && Reflect.getMetadata(PATH_METADATA, value) !== undefined
      )
      .flatMap((controller) =>
        Object.getOwnPropertyNames(controller.prototype).flatMap((method) => {
          const asked = Reflect.getMetadata('Permissions', controller.prototype[method]) as [Array<string>] | undefined;

          return (asked?.[0] ?? []).map((permission) => ({ permission, route: `${controller.name}.${method}` }));
        })
      )
  );
}

/** The permissions the tenant script defines. */
function definedPermissions(): Set<string> {
  const script = readFileSync(join(ROOT, 'scripts/gisday-auth0-dev.ps1'), 'utf8');

  return new Set(script.match(/'(create|read|update|delete):[a-z-]+'/g)?.map((quoted) => quoted.slice(1, -1)) ?? []);
}

describe('the permissions the GIS Day API asks for (#3101)', () => {
  // It imports every controller in the API, which under Vitest means transforming each one first: about 5 s on a quiet
  // machine and more on a busy one, past Vitest's 5 s default for a test (Jest's was the same, but its transform was
  // already cached by then). So the routes are read once, with room to do it, and both tests share them (#1977).
  let routes: Array<{ permission: string; route: string }>;
  beforeAll(async () => {
    routes = await routePermissions();
  }, 60_000);

  it('finds the routes and the defined permissions', async () => {
    expect(routes.length).toBeGreaterThan(50);
    expect(definedPermissions().has('update:speakers')).toBe(true);
  });

  it('asks only for permissions the Auth0 API defines', async () => {
    const defined = definedPermissions();
    const undefinedOnes = routes.filter(({ permission }) => !defined.has(permission));

    expect(undefinedOnes).toEqual([]);
  });
});

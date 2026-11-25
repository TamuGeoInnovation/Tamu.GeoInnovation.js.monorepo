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

/** Every permission a route of these libraries asks for, with where. */
function routePermissions(): Array<{ permission: string; route: string }> {
  return LIBRARIES.flatMap((library) => controllerFiles(join(ROOT, library))).flatMap((file) =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Object.values(require(file) as Record<string, unknown>)
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
  it('finds the routes and the defined permissions', () => {
    expect(routePermissions().length).toBeGreaterThan(50);
    expect(definedPermissions().has('update:speakers')).toBe(true);
  });

  it('asks only for permissions the Auth0 API defines', () => {
    const defined = definedPermissions();
    const undefinedOnes = routePermissions().filter(({ permission }) => !defined.has(permission));

    expect(undefinedOnes).toEqual([]);
  });
});

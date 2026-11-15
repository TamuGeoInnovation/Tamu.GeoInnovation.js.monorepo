import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsGuard } from './permissions.guard';

/**
 * #3038. A refused request names the permission it lacked, so the admin page can say which one to give, rather than "try
 * again". On 15 November 2026 the Check-ins dashboard got a bare 403 because `read:checkins` was never defined in Auth0.
 */
describe('PermissionsGuard', () => {
  function context(permissions: Array<string>) {
    return {
      getHandler: () => undefined,
      getClass: () => PermissionsGuard,
      switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) })
    } as unknown as ExecutionContext;
  }

  function guard(required: Array<string>, matchType?: 'all' | 'some') {
    return new PermissionsGuard({ get: () => [required, matchType] } as unknown as Reflector);
  }

  it('names the permission a refused request lacked', async () => {
    const refusal = guard(['read:checkins']).canActivate(context(['read:rsvps']));

    await expect(refusal).rejects.toThrow(ForbiddenException);
    await expect(refusal).rejects.toThrow(/read:checkins/);
    await expect(refusal).rejects.toThrow(/Auth0/);
  });

  it('names every permission it needed, all of them joined by "and"', async () => {
    await expect(guard(['read:a', 'read:b'], 'all').canActivate(context(['read:a']))).rejects.toThrow(/read:a and read:b/);
  });

  it('lets a request with the permission through', async () => {
    await expect(guard(['read:checkins']).canActivate(context(['read:checkins']))).resolves.toBe(true);
  });

  it('names the permission too when the token carries no permissions at all', async () => {
    const noPermissions = {
      getHandler: () => undefined,
      getClass: () => PermissionsGuard,
      switchToHttp: () => ({ getRequest: () => ({ user: {} }) })
    } as unknown as ExecutionContext;

    await expect(guard(['read:checkins']).canActivate(noPermissions)).rejects.toThrow(/read:checkins/);
  });
});

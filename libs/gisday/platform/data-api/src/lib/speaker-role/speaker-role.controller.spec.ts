import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SpeakerRoleController } from './speaker-role.controller';
import { SpeakerRoleProvider } from './speaker-role.provider';

/**
 * #3668: speaker roles are written only by an admin who can add or remove speakers, as speakers themselves are.
 * Requests go through Nest's real routing, body parsing and `PermissionsGuard`; only the token check is replaced, by
 * a signed-in user whose permissions each test chooses.
 */
describe('SpeakerRoleController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const provider = { insertRoles: vi.fn(), deleteEntity: vi.fn(), find: vi.fn() };

  const send = (method: string, path: string, body?: object) =>
    fetch(`${url}/speaker-roles${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    permissions = [];
    provider.insertRoles.mockReset().mockResolvedValue([{ guid: 'role-1', name: 'Keynote' }]);
    provider.deleteEntity.mockReset().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      controllers: [SpeakerRoleController],
      providers: [{ provide: SpeakerRoleProvider, useValue: provider }]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions };
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('adds speaker roles for an admin who can add speakers', async () => {
    permissions = ['create:speakers'];

    const response = await send('POST', '/bulk', { roles: [{ name: 'Keynote' }] });

    expect(response.status).toBe(201);
    expect(provider.insertRoles).toHaveBeenCalledWith([{ name: 'Keynote' }]);
  });

  it('deletes a speaker role for an admin who can remove speakers', async () => {
    permissions = ['delete:speakers'];

    expect((await send('DELETE', '/role-1')).status).toBe(200);
    expect(provider.deleteEntity).toHaveBeenCalledWith({ where: { guid: 'role-1' } });
  });

  it('refuses to add or delete speaker roles for an account that cannot change speakers', async () => {
    permissions = ['read:rsvps'];

    expect((await send('POST', '/bulk', { roles: [{ name: 'Keynote' }] })).status).toBe(403);
    expect((await send('DELETE', '/role-1')).status).toBe(403);
    expect(provider.insertRoles).not.toHaveBeenCalled();
    expect(provider.deleteEntity).not.toHaveBeenCalled();
  });

  it('refuses to add with only the delete permission, and to delete with only the add permission', async () => {
    permissions = ['delete:speakers'];
    expect((await send('POST', '/bulk', { roles: [{ name: 'Keynote' }] })).status).toBe(403);

    permissions = ['create:speakers'];
    expect((await send('DELETE', '/role-1')).status).toBe(403);

    expect(provider.insertRoles).not.toHaveBeenCalled();
    expect(provider.deleteEntity).not.toHaveBeenCalled();
  });
});

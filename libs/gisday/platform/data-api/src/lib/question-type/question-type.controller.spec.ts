import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { QuestionTypeController } from './question-type.controller';
import { QuestionTypeProvider } from './question-type.provider';

/**
 * #3668: question types are written only by an admin who can add or remove accounts (`create:users`, `delete:users`),
 * the maintainer's choice, so nothing changes in Auth0. Reading them stays open. Requests go through Nest's real
 * routing, body parsing and `PermissionsGuard`; only the token check is replaced, by a signed-in user whose permissions
 * each test chooses.
 */
describe('QuestionTypeController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const provider = { deleteEntity: vi.fn(), find: vi.fn(), findOne: vi.fn() };

  const send = (method: string, path: string, body?: object) =>
    fetch(`${url}/question-types${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    permissions = [];
    provider.deleteEntity.mockReset().mockResolvedValue(undefined);
    provider.find.mockReset().mockResolvedValue([]);

    const module = await Test.createTestingModule({
      controllers: [QuestionTypeController],
      providers: [{ provide: QuestionTypeProvider, useValue: provider }]
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

  it('deletes a question type for an admin who can remove accounts', async () => {
    permissions = ['delete:users'];

    expect((await send('DELETE', '/type-1')).status).toBe(200);
    expect(provider.deleteEntity).toHaveBeenCalledWith({ where: { guid: 'type-1' } });
  });

  it('lets an admin who can add accounts through to adding and updating, which are not built', async () => {
    permissions = ['create:users'];

    // Past the guard, the handlers answer 501 as before: the guard is what changed, not what they do.
    expect((await send('POST', '', { type: 'Made-up type' })).status).toBe(501);
    expect((await send('PATCH', '/type-1', { type: 'Made-up type' })).status).toBe(501);
  });

  it('refuses to add, update or delete a question type for an account that cannot change accounts', async () => {
    permissions = ['read:rsvps'];

    expect((await send('POST', '', { type: 'Made-up type' })).status).toBe(403);
    expect((await send('PATCH', '/type-1', { type: 'Made-up type' })).status).toBe(403);
    expect((await send('DELETE', '/type-1')).status).toBe(403);
    expect(provider.deleteEntity).not.toHaveBeenCalled();
  });

  it('refuses to delete with only the add permission, and to add or update with only the delete permission', async () => {
    permissions = ['create:users'];
    expect((await send('DELETE', '/type-1')).status).toBe(403);

    permissions = ['delete:users'];
    expect((await send('POST', '', { type: 'Made-up type' })).status).toBe(403);
    expect((await send('PATCH', '/type-1', { type: 'Made-up type' })).status).toBe(403);

    expect(provider.deleteEntity).not.toHaveBeenCalled();
  });

  it('still lists question types for anyone', async () => {
    expect((await send('GET', '')).status).toBe(200);
  });
});

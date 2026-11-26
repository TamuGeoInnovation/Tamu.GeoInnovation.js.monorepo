import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SubmissionTypeController } from './submission-type.controller';
import { SubmissionTypeProvider } from './submission-type.provider';

/**
 * #3635: Admin > Submission Types offered Add and Update, and the API answered 501 to both. Requests go through Nest's
 * real routing, body parsing and `PermissionsGuard`; only the token check is replaced, by a signed-in user whose
 * permissions each test chooses.
 */
describe('SubmissionTypeController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const provider = { create: vi.fn(), update: vi.fn(), deleteEntities: vi.fn(), find: vi.fn(), findOne: vi.fn() };

  const send = (method: string, path: string, body?: object) =>
    fetch(`${url}/submission-types${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    permissions = [];
    provider.create.mockReset().mockResolvedValue({ guid: 'type-1', type: 'poster' });
    provider.update.mockReset().mockResolvedValue({ guid: 'type-1', type: 'presentation' });
    provider.deleteEntities.mockReset().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      controllers: [SubmissionTypeController],
      providers: [{ provide: SubmissionTypeProvider, useValue: provider }]
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

  it('creates a submission type for an admin who can change competitions', async () => {
    permissions = ['update:competitions'];

    const response = await send('POST', '', { type: 'poster' });

    expect(response.status).toBe(201);
    expect(provider.create).toHaveBeenCalledWith({ type: 'poster' });
    expect(await response.json()).toEqual({ guid: 'type-1', type: 'poster' });
  });

  it('updates a submission type for an admin who can change competitions', async () => {
    permissions = ['update:competitions'];

    const response = await send('PATCH', '/type-1', { type: 'presentation' });

    expect(response.status).toBe(200);
    expect(provider.update).toHaveBeenCalledWith('type-1', { type: 'presentation' });
  });

  it('deletes a submission type for an admin who can change competitions', async () => {
    permissions = ['update:competitions'];

    expect((await send('DELETE', '/type-1')).status).toBe(200);
    expect(provider.deleteEntities).toHaveBeenCalledWith('type-1');
  });

  it('refuses to create, update or delete for an account that cannot change competitions', async () => {
    permissions = ['read:competitions'];

    expect((await send('POST', '', { type: 'poster' })).status).toBe(403);
    expect((await send('PATCH', '/type-1', { type: 'presentation' })).status).toBe(403);
    expect((await send('DELETE', '/type-1')).status).toBe(403);
    expect(provider.create).not.toHaveBeenCalled();
    expect(provider.update).not.toHaveBeenCalled();
    expect(provider.deleteEntities).not.toHaveBeenCalled();
  });
});

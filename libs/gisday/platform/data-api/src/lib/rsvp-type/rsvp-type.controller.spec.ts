import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { RsvpTypeController } from './rsvp-type.controller';
import { RsvpTypeProvider } from './rsvp-type.provider';

/**
 * #3635: Admin > RSVP Types offered Add and Update, and the API answered 501 to both. Requests go through Nest's real
 * routing, body parsing and `PermissionsGuard`; only the token check is replaced, by a signed-in user whose permissions
 * each test chooses.
 */
describe('RsvpTypeController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const provider = { create: vi.fn(), update: vi.fn(), deleteEntities: vi.fn(), find: vi.fn(), findOne: vi.fn() };

  const send = (method: string, path: string, body?: object) =>
    fetch(`${url}/rsvp-types${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    permissions = [];
    provider.create.mockReset().mockResolvedValue({ guid: 'type-1', type: 'Workshop' });
    provider.update.mockReset().mockResolvedValue({ guid: 'type-1', type: 'Lecture' });
    provider.deleteEntities.mockReset().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      controllers: [RsvpTypeController],
      providers: [{ provide: RsvpTypeProvider, useValue: provider }]
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

  it('creates an RSVP type for an admin who can change events', async () => {
    permissions = ['update:events'];

    const response = await send('POST', '', { type: 'Workshop' });

    expect(response.status).toBe(201);
    expect(provider.create).toHaveBeenCalledWith({ type: 'Workshop' });
    expect(await response.json()).toEqual({ guid: 'type-1', type: 'Workshop' });
  });

  it('updates an RSVP type for an admin who can change events', async () => {
    permissions = ['update:events'];

    const response = await send('PATCH', '/type-1', { type: 'Lecture' });

    expect(response.status).toBe(200);
    expect(provider.update).toHaveBeenCalledWith('type-1', { type: 'Lecture' });
  });

  it('deletes an RSVP type for an admin who can change events', async () => {
    permissions = ['update:events'];

    expect((await send('DELETE', '/type-1')).status).toBe(200);
    expect(provider.deleteEntities).toHaveBeenCalledWith('type-1');
  });

  it('refuses to create, update or delete for an account that cannot change events', async () => {
    permissions = ['read:rsvps'];

    expect((await send('POST', '', { type: 'Workshop' })).status).toBe(403);
    expect((await send('PATCH', '/type-1', { type: 'Lecture' })).status).toBe(403);
    expect((await send('DELETE', '/type-1')).status).toBe(403);
    expect(provider.create).not.toHaveBeenCalled();
    expect(provider.update).not.toHaveBeenCalled();
    expect(provider.deleteEntities).not.toHaveBeenCalled();
  });
});

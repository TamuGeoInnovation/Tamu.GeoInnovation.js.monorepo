import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { CheckInController } from './check-in/check-in.controller';
import { CheckInDashboardProvider } from './check-in/check-in-dashboard.provider';
import { CheckInProvider } from './check-in/check-in.provider';
import { SpeakerRoleController } from './speaker-role/speaker-role.controller';
import { SpeakerRoleProvider } from './speaker-role/speaker-role.provider';

/**
 * Routes that were never built and only answered 501 are gone (#3896, #1899): nothing called them, and a route that
 * can only fail is a trap (#3635). Through Nest's real routing, with the guards passed, so a route that still exists
 * answers rather than being refused at the door. The season-day routes are in season-day.controller.spec.ts.
 */
describe('the platform API without its never-built routes (#3896)', () => {
  let app: INestApplication;
  let url: string;
  const deleted = vi.fn();

  const send = (method: string, path: string) =>
    fetch(`${url}/${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      body: method === 'GET' || method === 'DELETE' ? undefined : '{}'
    });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AssetsController, CheckInController, SpeakerRoleController],
      providers: [
        { provide: AssetsService, useValue: { findOne: async (guid: string) => ({ guid }) } },
        { provide: CheckInProvider, useValue: { deleteEntity: async (options: unknown) => deleted(options) } },
        { provide: CheckInDashboardProvider, useValue: {} },
        { provide: SpeakerRoleProvider, useValue: { find: async () => [{ guid: 'r-1' }] } }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    ['GET', 'assets'],
    ['POST', 'assets'],
    ['PATCH', 'assets/a-1'],
    ['DELETE', 'assets/a-1'],
    ['PATCH', 'check-ins/c-1'],
    ['POST', 'speaker-roles'],
    ['PATCH', 'speaker-roles/r-1']
  ])('has no %s %s', async (method, path) => {
    expect((await send(method, path)).status).toBe(404);
  });

  it('still answers the routes that work', async () => {
    expect(await (await send('GET', 'assets/a-1')).json()).toEqual({ guid: 'a-1' });
    expect(await (await send('GET', 'speaker-roles')).json()).toEqual([{ guid: 'r-1' }]);
    expect((await send('DELETE', 'check-ins/c-1')).status).toBe(200);
    expect(deleted).toHaveBeenCalledWith({ where: { guid: 'c-1' } });
  });
});

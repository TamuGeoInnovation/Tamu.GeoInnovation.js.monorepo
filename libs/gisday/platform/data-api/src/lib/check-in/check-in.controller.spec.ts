import { ExecutionContext, INestApplication } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { CheckInController } from './check-in.controller';
import { CheckInProvider } from './check-in.provider';

/**
 * Requests go through Nest's real routing, body parsing and `PermissionsGuard`, so what is checked is
 * which account the request body can and cannot name. Only the token check is replaced: the signed-in
 * user is an admin whose permissions each test chooses.
 */
describe('CheckInController', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const provider = { insertUserCheckin: jest.fn(), insertAttendeeCheckin: jest.fn(), getCheckInCode: jest.fn() };

  const post = (path: string, body: object) =>
    fetch(`${url}/check-ins${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    provider.insertUserCheckin.mockReset().mockResolvedValue({ guid: 'checkin-1' });
    provider.insertAttendeeCheckin.mockReset().mockResolvedValue({ guid: 'checkin-1' });
    provider.getCheckInCode.mockReset().mockResolvedValue({ code: 'code-1' });

    const module = await Test.createTestingModule({
      controllers: [CheckInController],
      providers: [{ provide: CheckInProvider, useValue: provider }]
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
    await app.close();
  });

  describe('POST /check-ins (attendee)', () => {
    it('checks in the signed-in user and ignores a userGuid in the body', async () => {
      const response = await post('', { userGuid: 'attendee-1', eventGuid: 'event-1' });

      expect(response.status).toBe(201);
      expect(provider.insertUserCheckin).toHaveBeenCalledWith('event-1', 'admin-1', expect.anything(), undefined);
      expect(provider.insertAttendeeCheckin).not.toHaveBeenCalled();
    });

    it('passes the position on, for the zone check (#1766)', async () => {
      const position = { latitude: 30.6122, longitude: -96.3414, accuracy: 12 };

      await post('', { eventGuid: 'event-1', ...position });

      expect(provider.insertUserCheckin).toHaveBeenCalledWith('event-1', 'admin-1', position, undefined);
    });

    it('passes the QR code on, for a hybrid or virtual session (#2560)', async () => {
      await post('', { eventGuid: 'event-1', code: 'code-1' });

      expect(provider.insertUserCheckin).toHaveBeenCalledWith('event-1', 'admin-1', expect.anything(), 'code-1');
    });
  });

  describe('GET /check-ins/code/:eventGuid (#2560)', () => {
    const get = (path: string) => fetch(`${url}/check-ins${path}`);

    it('gives an organizer with create:checkins the session code', async () => {
      permissions = ['create:checkins'];

      const response = await get('/code/event-1');

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ code: 'code-1' });
      expect(provider.getCheckInCode).toHaveBeenCalledWith('event-1');
    });

    it('refuses an attendee, who could otherwise check in without attending', async () => {
      permissions = [];

      expect((await get('/code/event-1')).status).toBe(403);
      expect(provider.getCheckInCode).not.toHaveBeenCalled();
    });

    it('is guarded by a token and the create:checkins permission', () => {
      const handler = Object.getOwnPropertyDescriptor(CheckInController.prototype, 'getCheckInCode')?.value;

      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([JwtGuard, PermissionsGuard]);
      expect(Reflect.getMetadata('Permissions', handler)).toEqual([['create:checkins'], 'some']);
    });
  });

  describe('POST /check-ins/admin (#1767)', () => {
    it('records the attendee given, not the admin, with no location and no zone check', async () => {
      permissions = ['create:checkins'];

      const response = await post('/admin', { userGuid: 'attendee-1', eventGuid: 'event-1' });

      expect(response.status).toBe(201);
      expect(provider.insertAttendeeCheckin).toHaveBeenCalledTimes(1);
      expect(provider.insertAttendeeCheckin).toHaveBeenCalledWith('event-1', 'attendee-1');
      // The attendee path is the one held to the zone (#1766).
      expect(provider.insertUserCheckin).not.toHaveBeenCalled();
    });

    it('refuses an account without create:checkins', async () => {
      permissions = ['read:checkins'];

      const response = await post('/admin', { userGuid: 'attendee-1', eventGuid: 'event-1' });

      expect(response.status).toBe(403);
      expect(provider.insertAttendeeCheckin).not.toHaveBeenCalled();
    });

    it('refuses a request missing the attendee or the event', async () => {
      permissions = ['create:checkins'];

      expect((await post('/admin', { eventGuid: 'event-1' })).status).toBe(400);
      expect((await post('/admin', { userGuid: 'attendee-1' })).status).toBe(400);
      expect(provider.insertAttendeeCheckin).not.toHaveBeenCalled();
    });

    it('is guarded by a token and the create:checkins permission', () => {
      const handler = Object.getOwnPropertyDescriptor(CheckInController.prototype, 'insertAttendeeCheckin')?.value;

      expect(handler).toBeDefined();
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([JwtGuard, PermissionsGuard]);
      expect(Reflect.getMetadata('Permissions', handler)).toEqual([['create:checkins'], 'some']);
    });
  });
});

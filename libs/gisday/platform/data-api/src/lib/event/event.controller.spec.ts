import { NotFoundException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { lastValueFrom, Observable, of } from 'rxjs';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { EventController } from './event.controller';
import { EventProvider } from './event.provider';

/**
 * The public event routes (#3354): a hidden session (`active` false) was returned by every one of them, name, time and
 * place, to anyone who asked. Hidden now, as the presenter route hides them (#3345), except to an account that may put
 * one back on the schedule (update:events), so the admin pages that read these routes still see every session.
 * Red on today's code.
 */
describe('EventController, hidden sessions (#3354)', () => {
  const shown = { guid: 'e-shown', name: 'A made-up session', active: true };
  const hidden = { guid: 'e-hidden', name: 'A made-up hidden session', active: false };
  const both = () => [{ ...shown }, { ...hidden }];

  const anyone = {};
  const visitor = { user: { sub: 'auth0|visitor', permissions: [] } };
  const admin = { user: { sub: 'auth0|admin', permissions: ['update:events'] } };

  /** The controller, called with the account as today's signatures do not yet take it, so this compiles on both. */
  type Routes = Record<string, (...args: Array<unknown>) => Promise<unknown>>;

  function controller(): Routes {
    const provider = {
      getEvents: jest.fn(async () => both()),
      getEventsForActiveSeason: jest.fn(async () => both()),
      getEventsForSeason: jest.fn(async () => both()),
      getEntitiesByDay: jest.fn(async () => of([[{ ...shown }], [{ ...hidden }]])),
      findOne: jest.fn(async ({ where }) => both().find((e) => e.guid === where.guid) ?? null),
      getEventDetails: jest.fn(async (guid: string) => both().find((e) => e.guid === guid))
    };

    return new EventController(provider as unknown as EventProvider) as unknown as Routes;
  }

  const lists: Array<[string, (c: Routes, req: object) => Promise<unknown>]> = [
    ['GET /events', (c, req) => c.getEvents(req)],
    ['GET /events/season/active', (c, req) => c.getEventsForActiveSeason(req)],
    ['GET /events/season/:guid', (c, req) => c.getEventsForSeason('s-2027', req)],
    [
      'GET /events/by-day',
      async (c, req) => (await lastValueFrom((await c.getEntitiesByDay(req)) as Observable<Array<Array<object>>>)).flat()
    ]
  ];

  it.each(lists)('%s leaves out hidden sessions, for anyone and for a visitor signed in', async (_route, ask) => {
    for (const req of [anyone, visitor]) {
      expect(((await ask(controller(), req)) as Array<{ guid: string }>).map((e) => e.guid)).toEqual(['e-shown']);
    }
  });

  it.each(lists)('%s lists hidden sessions too, for an admin who may put them back', async (_route, ask) => {
    expect(((await ask(controller(), admin)) as Array<{ guid: string }>).map((e) => e.guid)).toEqual([
      'e-shown',
      'e-hidden'
    ]);
  });

  const byId: Array<[string, (c: Routes, req: object, guid: string) => Promise<unknown>]> = [
    ['GET /events/:guid', (c, req, guid) => c.getDetails(req, guid)],
    ['GET /events/:guid/event', (c, req, guid) => c.getEntityWithRelations(guid, req)]
  ];

  it.each(byId)('%s answers 404 for a hidden session, to anyone and to a visitor signed in', async (_route, ask) => {
    for (const req of [anyone, visitor]) {
      await expect(ask(controller(), req, 'e-hidden')).rejects.toBeInstanceOf(NotFoundException);
    }
  });

  it.each(byId)('%s answers a hidden session to an admin, for its edit page', async (_route, ask) => {
    await expect(ask(controller(), admin, 'e-hidden')).resolves.toMatchObject({ guid: 'e-hidden' });
  });

  it.each(byId)('%s answers a session on the schedule to anyone', async (_route, ask) => {
    await expect(ask(controller(), anyone, 'e-shown')).resolves.toMatchObject({ guid: 'e-shown' });
  });

  const routes = EventController.prototype as unknown as Record<string, object>;

  // Without the guard there is no signed-in account to read, so an admin would be treated as anyone.
  it.each(['getEvents', 'getEventsForActiveSeason', 'getEventsForSeason', 'getEntitiesByDay', 'getDetails', 'getEntityWithRelations'])(
    '%s reads the account, if any, from the sign-in',
    (method) => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routes[method]) ?? [];

      expect(guards).toContain(JwtGuard);
      expect(Reflect.getMetadata('AllowAny', routes[method])).toBe('true');
    }
  );
});

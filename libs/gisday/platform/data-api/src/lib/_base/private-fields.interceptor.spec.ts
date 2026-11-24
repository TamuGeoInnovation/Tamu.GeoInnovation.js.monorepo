import { ExecutionContext, INestApplication, RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Event, EventBroadcast, Organization, Speaker, Sponsor } from '../entities/all.entity';
import { CheckInController } from '../check-in/check-in.controller';
import { EventController } from '../event/event.controller';
import { EventBroadcastController } from '../event-broadcast/event-broadcast.controller';
import { EventProvider } from '../event/event.provider';
import { OrganizationController } from '../organization/organization.controller';
import { OrganizationService } from '../organization/organization.service';
import { SeasonWinnerController } from '../season-winner/season-winner.controller';
import { SpeakerController } from '../speaker/speaker.controller';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SponsorController } from '../sponsor/sponsor.controller';
import { SponsorProvider } from '../sponsor/sponsor.provider';
import { UserRsvpController } from '../user-rsvp/user-rsvp.controller';
import { PRIVATE_FIELDS, PrivateFieldsInterceptor, withoutPrivateFields } from './private-fields.interceptor';

const PRIVATE_KEYS = [
  'contactFirstName',
  'contactLastName',
  'contactEmail',
  'sponsorshipAmount',
  'email',
  'accountGuid',
  // Whether a badge is printed is for the admins who print them (#2908).
  'badgePrintedAt',
  'badgePrintedText'
];

function organization() {
  return Object.assign(new Organization(), {
    guid: 'org-1',
    name: 'An organization',
    contactFirstName: 'Pat',
    contactLastName: 'Doe',
    contactEmail: 'pat@example.com'
  });
}

function speaker() {
  return Object.assign(new Speaker(), {
    guid: 'speaker-1',
    firstName: 'Sam',
    lastName: 'Lee',
    email: 'sam@example.com',
    accountGuid: 'auth0|speaker-1',
    badgePrintedAt: new Date('2026-11-13T17:00:00Z'),
    badgePrintedText: 'Sam|Lee|An organization|',
    organization: organization()
  });
}

function sponsor() {
  return Object.assign(new Sponsor(), {
    guid: 'sponsor-1',
    name: 'A sponsor',
    website: 'https://example.com/',
    contactFirstName: 'Pat',
    contactLastName: 'Doe',
    contactEmail: 'pat@example.com',
    sponsorshipAmount: '5000'
  });
}

function event() {
  return Object.assign(new Event(), { guid: 'event-1', name: 'A session', speakers: [speaker()] });
}

/**
 * A provider whose every method answers with fresh records, so each route returns what its real one would hold. Not
 * `then` or Nest's lifecycle hooks, which Nest looks for on a provider and must not find.
 */
function answering(make: () => unknown) {
  return new Proxy(
    {},
    {
      get: (_, name) =>
        typeof name !== 'string' || name === 'then' || /^(on|before)[A-Z]/.test(name)
          ? undefined
          : () => Promise.resolve([make()])
    }
  );
}

/** Every key at any depth of `value`. */
function keysOf(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    value.forEach((v) => keysOf(v, into));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => {
      into.add(k);
      keysOf(v, into);
    });
  }

  return into;
}

/**
 * Requests go through Nest's real routing and the interceptor, applied to every route as gisday-nest applies it.
 * Only the token check is replaced: `user` is the signed-in caller, or undefined for a signed-out one. The event
 * routes have no guard, so their caller is always signed out, as in production.
 */
describe('PrivateFieldsInterceptor', () => {
  let app: INestApplication;
  let url: string;
  let user: { sub: string; permissions: Array<string> } | undefined;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [SponsorController, OrganizationController, SpeakerController, EventController],
      providers: [
        { provide: SponsorProvider, useValue: answering(sponsor) },
        { provide: OrganizationService, useValue: answering(organization) },
        { provide: SpeakerProvider, useValue: answering(speaker) },
        { provide: EventProvider, useValue: answering(event) }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = user;
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    // For every route, as gisday-nest's AppModule registers it (APP_INTERCEPTOR).
    app.useGlobalInterceptors(new PrivateFieldsInterceptor());
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  const fetchFrom = (path: string) => fetch(`${url}${path}`);
  const get = async (path: string) => (await fetchFrom(path)).json();

  const PUBLIC_ROUTES = [
    '/sponsors',
    '/sponsors/season/active',
    '/sponsors/season/season-1',
    '/sponsors/sponsor-1',
    '/organizations',
    '/organizations/season/active',
    '/organizations/season/season-1',
    '/organizations/active-events',
    '/organizations/org-1',
    '/speakers',
    '/speakers/season/active',
    '/speakers/season/season-1',
    '/speakers/organizers',
    '/speakers/organizers/season/active',
    '/speakers/organizers/season/season-1',
    '/speakers/participating',
    '/speakers/participating/season/season-1',
    '/speakers/speaker-1',
    '/events',
    '/events/season/active',
    '/events/season/season-1',
    '/events/by-day',
    '/events/event-1/event'
  ];

  describe('signed out', () => {
    beforeAll(() => {
      user = undefined;
    });

    it.each(PUBLIC_ROUTES)('GET %s has no contact details, sponsorship amount, email or account', async (path) => {
      const keys = keysOf(await get(path));

      expect(PRIVATE_KEYS.filter((k) => keys.has(k))).toEqual([]);
      expect(keys.has('name') || keys.has('firstName')).toBe(true);
    });
  });

  describe('signed in without the admin permissions', () => {
    beforeAll(() => {
      user = { sub: 'attendee-1', permissions: [] };
    });

    it.each(['/sponsors', '/organizations', '/speakers'])('GET %s still has none of them', async (path) => {
      const keys = keysOf(await get(path));

      expect(PRIVATE_KEYS.filter((k) => keys.has(k))).toEqual([]);
    });
  });

  describe('an admin', () => {
    beforeAll(() => {
      user = { sub: 'admin-1', permissions: ['update:sponsors', 'update:organizations', 'update:speakers'] };
    });

    it('gets the sponsors with their contacts and amounts', async () => {
      const [s] = await get('/sponsors');

      expect(s).toMatchObject({
        contactFirstName: 'Pat',
        contactLastName: 'Doe',
        contactEmail: 'pat@example.com',
        sponsorshipAmount: '5000'
      });
    });

    it('gets the organizations with their contacts', async () => {
      const [o] = await get('/organizations/org-1');

      expect(o).toMatchObject({ contactFirstName: 'Pat', contactLastName: 'Doe', contactEmail: 'pat@example.com' });
    });

    it('gets the speakers with their emails, accounts and printed badges', async () => {
      const [s] = await get('/speakers');

      expect(s).toMatchObject({
        email: 'sam@example.com',
        accountGuid: 'auth0|speaker-1',
        badgePrintedText: 'Sam|Lee|An organization|'
      });
    });
  });

  describe('caching', () => {
    it("tells caches that the answer depends on the caller's token", async () => {
      user = undefined;
      const response = await fetchFrom('/sponsors');

      expect(response.headers.get('vary')).toMatch(/Authorization/i);
      // A signed-out answer holds nothing private, so it may be cached as before: no Cache-Control is added.
      expect(response.headers.get('cache-control') ?? '').not.toMatch(/no-store/);
    });

    it("forbids storing an admin's answer, which keeps the private fields", async () => {
      user = { sub: 'admin-1', permissions: ['update:sponsors'] };
      const response = await fetchFrom('/sponsors');

      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('vary')).toMatch(/Authorization/i);
    });
  });
});

describe('withoutPrivateFields', () => {
  it("keeps only what the caller's permissions unlock", () => {
    const [s] = withoutPrivateFields([sponsor()], ['update:organizations']);

    expect(s.contactEmail).toBeUndefined();
    expect(s.sponsorshipAmount).toBeUndefined();
    expect(s.name).toBe('A sponsor');
  });

  it('removes contact details from a plain object too', () => {
    const plain = withoutPrivateFields({ name: 'Copied', contactEmail: 'pat@example.com' });

    expect(plain).toEqual({ name: 'Copied' });
  });

  it('follows a record that refers back to itself without looping', () => {
    const s = speaker();
    const e = event();
    e.speakers = [s];
    (s as unknown as { events: Array<Event> }).events = [e];

    withoutPrivateFields(e);

    expect(s.email).toBeUndefined();
    expect(s.organization.contactEmail).toBeUndefined();
  });
});

/**
 * The read routes the admin pages use must let an admin's token through, and must not turn away anyone else. A
 * browser keeps an expired token, and the public pages send it with every request.
 */
describe('the read routes of sponsors, organizations and speakers', () => {
  const controllers = [SponsorController, OrganizationController, SpeakerController];
  const reads = controllers.flatMap((controller) =>
    Object.getOwnPropertyNames(controller.prototype)
      .map((name) => ({ controller, name, handler: controller.prototype[name] }))
      .filter(
        ({ handler }) => typeof handler === 'function' && Reflect.getMetadata(METHOD_METADATA, handler) === RequestMethod.GET
      )
  );

  // A read that names a permission is for admins only, on purpose: the Speaker badges dashboard's list of every
  // presenter, photo or not (#2995), and the admin Speakers list's speakers with their sessions, which include sessions
  // hidden from the public schedule (#441).
  const adminOnly = (r: (typeof reads)[number]) => Reflect.getMetadata('Permissions', r.handler) !== undefined;
  const open = reads.filter((r) => !adminOnly(r));

  it('are all found', () => {
    expect(reads.length).toBe(21);
    expect(reads.filter(adminOnly).map((r) => `${r.controller.name}.${r.name}`)).toEqual([
      'SpeakerController.getActiveEntitiesWithSessions',
      'SpeakerController.getSpeakersWithSessionsForSeason',
      'SpeakerController.getAllParticipatingSpeakersForSeason'
    ]);
  });

  it.each(open.map((r) => [`${r.controller.name}.${r.name}`, r]))('%s reads the token without requiring one', (_, r) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, r.handler)).toContain(JwtGuard);
    expect(Reflect.getMetadata('AllowAny', r.handler)).toBe('true');
  });

  it('keeps the admin-only reads behind their permission', () => {
    for (const handler of [
      SpeakerController.prototype.getAllParticipatingSpeakersForSeason,
      SpeakerController.prototype.getActiveEntitiesWithSessions,
      SpeakerController.prototype.getSpeakersWithSessionsForSeason
    ]) {
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
      expect(Reflect.getMetadata('Permissions', handler)[0]).toEqual(['update:speakers']);
    }
  });

  it('answers a request with an expired or bad token as a signed-out one, with no 401', () => {
    const guard = new JwtGuard(new Reflector());
    const handler = SponsorController.prototype.getEntities;
    const context = { getHandler: () => handler } as unknown as ExecutionContext;

    for (const info of [new Error('jwt expired'), new Error('invalid signature'), new Error('No auth token')]) {
      expect(() => guard.handleRequest(null, false, info, context)).not.toThrow();
      expect(guard.handleRequest(null, false, info, context)).toBeFalsy();
    }
  });
});

/**
 * Every column of these three tables is named here as public or private. A column added later fails this test until
 * someone decides which it is, so a new personal field cannot go out unnoticed. Private ones go in PRIVATE_FIELDS.
 */
describe('every column of sponsors, organizations and speakers is decided', () => {
  const PUBLIC: Record<string, Array<string>> = {
    Sponsor: ['guid', 'created', 'updated', 'name', 'website', 'description', 'sponsorshipLevel', 'active', 'logoSize'],
    Organization: ['guid', 'created', 'updated', 'name', 'acronym', 'website', 'text'],
    Speaker: [
      'guid',
      'created',
      'updated',
      'firstName',
      'lastName',
      'isActive',
      'isOrganizer',
      'graduationYear',
      'degree',
      'program',
      'affiliation',
      'description',
      'socialMedia'
    ],
    // The join details a session's page shows its signed-in visitors (#3054): the event route gives them only to them,
    // and the broadcast routes are for admins.
    EventBroadcast: ['guid', 'created', 'updated', 'name', 'password', 'phoneNumber', 'meetingId', 'publicUrl', 'details']
  };

  const columnsOf = (type: object) => {
    const chain: Array<object> = [];
    for (let t = type; t && t !== Function.prototype; t = Object.getPrototypeOf(t)) {
      chain.push(t);
    }

    return getMetadataArgsStorage()
      .columns.filter((c) => chain.includes(c.target as object))
      .map((c) => c.propertyName)
      .sort();
  };

  it.each(PRIVATE_FIELDS.map((rule) => [rule.type.name, rule]))('%s', (name, rule) => {
    const decided = [...PUBLIC[name as string], ...rule.fields].sort();

    expect(columnsOf(rule.type)).toEqual(decided);
  });
});

/**
 * The admin dashboards answer with people's names and emails as plain objects, which the interceptor does not look into
 * (it removes `email` only from speakers), so the permission on each route is what keeps them private (#2878, #3006).
 */
describe("the admin dashboards' routes", () => {
  const dashboards = [UserRsvpController, CheckInController].flatMap((controller) =>
    Object.getOwnPropertyNames(controller.prototype)
      .filter((name) => /^getDashboardFor/.test(name))
      .map((name) => ({ name: `${controller.name}.${name}`, handler: controller.prototype[name] }))
  );

  it('are all found', () => {
    expect(dashboards.map((d) => d.name)).toEqual([
      'UserRsvpController.getDashboardForSeason',
      'UserRsvpController.getDashboardForEvent',
      'CheckInController.getDashboardForSeason',
      'CheckInController.getDashboardForEvent'
    ]);
  });

  it.each(dashboards.map((d) => [d.name, d.handler]))('%s requires a token and an admin permission', (_, handler) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
    expect(Reflect.getMetadata('AllowAny', handler)).toBeUndefined();
    expect(Reflect.getMetadata('Permissions', handler)[0]).toEqual([expect.stringMatching(/^read:(rsvps|checkins)$/)]);
  });
});

/**
 * #3054. The broadcast routes answered anyone, signed in or not, with every Zoom's presenter link and join details.
 * Only admin pages read them, so each read needs the permission that edits a broadcast; and the presenter link is
 * private wherever a broadcast appears, an event's included.
 */
describe('broadcasts', () => {
  const reads = Object.getOwnPropertyNames(EventBroadcastController.prototype)
    .map((name) => ({ name, handler: EventBroadcastController.prototype[name] }))
    .filter(
      ({ handler }) => typeof handler === 'function' && Reflect.getMetadata(METHOD_METADATA, handler) === RequestMethod.GET
    );

  it.each(reads.map((r) => [r.name, r]))('%s is for broadcast admins only', (_, r) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, r.handler)).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
    expect(Reflect.getMetadata('Permissions', r.handler)[0]).toEqual(['update:event-broadcasts']);
    expect(Reflect.getMetadata('AllowAny', r.handler)).toBeUndefined();
  });

  function broadcast() {
    return Object.assign(new EventBroadcast(), {
      name: 'Zoom 1',
      presenterUrl: 'https://example.com/presenter',
      publicUrl: 'https://example.com/join'
    });
  }

  it("keeps a broadcast's presenter link from anyone who can't edit broadcasts, in an event too", () => {
    const e = event();
    e.broadcast = broadcast();

    withoutPrivateFields(e, ['update:events']);

    expect(e.broadcast.presenterUrl).toBeUndefined();
    expect(e.broadcast.publicUrl).toBe('https://example.com/join');
  });

  it('keeps it for a broadcast admin', () => {
    const [b] = withoutPrivateFields([broadcast()], ['update:event-broadcasts']);

    expect(b.presenterUrl).toBe('https://example.com/presenter');
  });
});

/**
 * #3239. A season's winners: the homepage's read is public and gives only place, names and title (the winners' spec
 * checks what it holds); the Winners page's read, which lists every accepted entry, is for whoever may see the
 * competitions, and picking the places for whoever may review them.
 */
describe('season winners', () => {
  const route = (name: keyof SeasonWinnerController) => SeasonWinnerController.prototype[name];

  it("leaves the homepage's read open, with no guard", () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, route('shown'))).toBeUndefined();
    expect(Reflect.getMetadata('Permissions', route('shown'))).toBeUndefined();
  });

  it.each([
    ['forSeason', 'read:competitions'],
    ['save', 'update:competitions']
  ] as const)('keeps %s behind a token and %s', (name, permission) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, route(name))).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
    expect(Reflect.getMetadata('Permissions', route(name))[0]).toEqual([permission]);
    expect(Reflect.getMetadata('AllowAny', route(name))).toBeUndefined();
  });
});

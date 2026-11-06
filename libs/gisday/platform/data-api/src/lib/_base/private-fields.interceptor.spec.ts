import { ExecutionContext, INestApplication, RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { getMetadataArgsStorage } from 'typeorm';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { Event, Organization, Speaker, Sponsor } from '../entities/all.entity';
import { EventController } from '../event/event.controller';
import { EventProvider } from '../event/event.provider';
import { OrganizationController } from '../organization/organization.controller';
import { OrganizationService } from '../organization/organization.service';
import { SpeakerController } from '../speaker/speaker.controller';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SponsorController } from '../sponsor/sponsor.controller';
import { SponsorProvider } from '../sponsor/sponsor.provider';
import { PRIVATE_FIELDS, PrivateFieldsInterceptor, withoutPrivateFields } from './private-fields.interceptor';

const PRIVATE_KEYS = ['contactFirstName', 'contactLastName', 'contactEmail', 'sponsorshipAmount', 'email', 'accountGuid'];

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

    it('gets the speakers with their emails and accounts', async () => {
      const [s] = await get('/speakers');

      expect(s).toMatchObject({ email: 'sam@example.com', accountGuid: 'auth0|speaker-1' });
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

  it('are all found', () => {
    expect(reads.length).toBe(18);
  });

  it.each(reads.map((r) => [`${r.controller.name}.${r.name}`, r]))('%s reads the token without requiring one', (_, r) => {
    expect(Reflect.getMetadata(GUARDS_METADATA, r.handler)).toContain(JwtGuard);
    expect(Reflect.getMetadata('AllowAny', r.handler)).toBe('true');
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
    ]
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

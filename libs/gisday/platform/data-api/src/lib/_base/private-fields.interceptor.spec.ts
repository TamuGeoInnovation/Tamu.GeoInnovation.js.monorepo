import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

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
import { PrivateFieldsInterceptor, withoutPrivateFields } from './private-fields.interceptor';

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
        typeof name !== 'string' || name === 'then' || /^(on|before)[A-Z]/.test(name) ? undefined : () => Promise.resolve([make()])
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

  const get = async (path: string) => (await fetch(`${url}${path}`)).json();

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

      expect(s).toMatchObject({ contactFirstName: 'Pat', contactLastName: 'Doe', contactEmail: 'pat@example.com', sponsorshipAmount: '5000' });
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

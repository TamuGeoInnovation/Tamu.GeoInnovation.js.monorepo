import { InternalServerErrorException, Logger } from '@nestjs/common';

import { ManagementService } from './management.service';

/**
 * What ManagementService asks Auth0's Management API for, and what it makes of the answers (#1218, auth0 7).
 *
 * No tenant and no credentials: `fetch`, which the auth0 SDK uses for every request, is replaced by a stand-in for
 * the tenant that answers the token endpoint and `/api/v2/users`, and records each request. So these check the
 * requests auth0 7 sends on our behalf - method, path, query, body - and how the service maps the responses,
 * which is what the move from auth0 3's getUser/updateUser/getUsers to 7's users.get/update/list could break.
 */
describe('ManagementService, against a stand-in for the Management API', () => {
  const domain = 'tenant.example.com';
  const credentials = { domain, clientId: 'client', clientSecret: 'secret' };

  interface Recorded {
    method: string;
    path: string;
    query: Record<string, string>;
    body: unknown;
    authorization: string | null;
  }

  let requests: Recorded[];
  let users: Record<string, Record<string, unknown>>;

  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  beforeEach(() => {
    requests = [];
    users = {
      'auth0|1': {
        user_id: 'auth0|1',
        name: 'Ada Lovelace',
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.edu',
        app_metadata: { gisday: { checkins: 3 }, other: 'kept out' },
        user_metadata: { education: 'BS', occupation: 'student' }
      },
      'google-oauth2|2': { user_id: 'google-oauth2|2', name: 'Grace Hopper', email: 'grace@example.edu' }
    };

    vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(input, init);
      const url = new URL(request.url);
      const text = await request.text();
      // The token request is a form; the Management API's are JSON.
      const body = !text
        ? undefined
        : request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
          ? Object.fromEntries(new URLSearchParams(text))
          : JSON.parse(text);

      requests.push({
        method: request.method,
        path: decodeURIComponent(url.pathname),
        query: Object.fromEntries(url.searchParams),
        body,
        authorization: request.headers.get('authorization')
      });

      if (url.host !== domain) {
        return json(500, { error: `request to ${url.host}, not the tenant` });
      }

      if (url.pathname === '/oauth/token') {
        return json(200, { access_token: 'stand-in-token', token_type: 'Bearer', expires_in: 86400 });
      }

      const match = /^\/api\/v2\/users\/(.+)$/.exec(decodeURIComponent(url.pathname));

      if (match && request.method === 'GET') {
        return users[match[1]]
          ? json(200, users[match[1]])
          : json(404, { statusCode: 404, message: 'The user does not exist.' });
      }

      if (match && request.method === 'PATCH') {
        users[match[1]] = { ...users[match[1]], ...(body as object) };

        return json(200, users[match[1]]);
      }

      // As the API answers: sorted by name when asked, a page of `per_page` (50 by default) at `page`, and with
      // include_totals the page in an envelope with where it starts and how many there are; without it, a bare array.
      if (url.pathname === '/api/v2/users' && request.method === 'GET') {
        const q = url.searchParams.get('q') ?? '';
        // A search by when the account was made, as getUsersCreatedBetween sends it:
        // created_at:[from TO to}, perhaps AND _exists_:app_metadata.gisday.
        const range = /^created_at:\[(\S+) TO (\S+)\}/.exec(q);
        // A search by id, as getUsersByIds sends it: user_id:("a" OR "b").
        const ids = [...q.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
        const all = Object.values(users)
          .filter((u) => {
            if (!q) {
              return true;
            }

            if (range) {
              const made = String(u['created_at']);
              const gisday = !q.includes('_exists_:app_metadata.gisday') || Boolean((u['app_metadata'] as Record<string, unknown>)?.['gisday']);

              return made >= range[1] && made < range[2] && gisday;
            }

            return ids.includes(String(u['user_id']));
          })
          .sort((a, b) =>
            url.searchParams.get('sort') === 'name:1'
              ? String(a['name']).localeCompare(String(b['name']))
              : url.searchParams.get('sort') === 'created_at:1'
                ? String(a['created_at']).localeCompare(String(b['created_at']))
                : 0
          );
        const perPage = Number(url.searchParams.get('per_page') ?? 50);
        const start = Number(url.searchParams.get('page') ?? 0) * perPage;
        const page = all.slice(start, start + perPage);

        return url.searchParams.get('include_totals') === 'true'
          ? json(200, { start, limit: perPage, length: page.length, total: all.length, users: page })
          : json(200, page);
      }

      return json(404, { message: `no stand-in for ${request.method} ${url.pathname}` });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** The requests to the Management API itself, without the token request before them. */
  const apiRequests = () => requests.filter((r) => r.path.startsWith('/api/v2/'));

  it('gets a client-credentials token from the tenant, and sends it with every request', async () => {
    await new ManagementService(credentials).getUserMetadata('auth0|1');

    const token = requests.find((r) => r.path === '/oauth/token');

    expect(token?.method).toBe('POST');
    expect(token?.body).toMatchObject({ grant_type: 'client_credentials', client_id: 'client', client_secret: 'secret' });
    expect(apiRequests().every((r) => r.authorization === 'Bearer stand-in-token')).toBe(true);
  });

  describe('getUserMetadata', () => {
    it('asks for the one user, by id', async () => {
      await new ManagementService(credentials).getUserMetadata('auth0|1');

      expect(apiRequests().map((r) => `${r.method} ${r.path}`)).toEqual(['GET /api/v2/users/auth0|1']);
    });

    it('maps the answer to the profile, with only the metadata the filters name', async () => {
      const profile = await new ManagementService(credentials).getUserMetadata('auth0|1', {
        app_metadata: 'gisday',
        user_metadata: ['education']
      });

      expect(profile).toEqual({
        user_info: {
          id: 'auth0|1',
          name: 'Ada Lovelace',
          given_name: 'Ada',
          family_name: 'Lovelace',
          email: 'ada@example.edu',
          connection: 'auth0',
          social: false
        },
        app_metadata: { gisday: { checkins: 3 } },
        user_metadata: { education: 'BS' }
      });
    });

    it('answers 500, as before, when the user does not exist', async () => {
      await expect(
        new ManagementService(credentials).getUserMetadata('auth0|missing', undefined, true)
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe('getUsersByIds (#2878)', () => {
    it('finds the users by searching for their ids, not one request each, and leaves out an id with no user', async () => {
      const found = await new ManagementService(credentials).getUsersByIds(['auth0|1', 'google-oauth2|2', 'auth0|missing']);

      expect(apiRequests()).toHaveLength(1);
      expect(apiRequests()[0].query).toMatchObject({
        q: 'user_id:("auth0|1" OR "google-oauth2|2" OR "auth0|missing")',
        search_engine: 'v3',
        per_page: '50'
      });
      expect([...found.keys()].sort()).toEqual(['auth0|1', 'google-oauth2|2']);
      expect(found.get('auth0|1')?.user_info?.email).toBe('ada@example.edu');
    });

    it('asks for 50 ids a request, and each id once', async () => {
      const ids = Array.from({ length: 120 }, (_, i) => `auth0|u${i}`);

      await new ManagementService(credentials).getUsersByIds([...ids, ...ids]);

      expect(apiRequests().map((r) => r.query['q'].split(' OR ').length)).toEqual([50, 50, 20]);
    });

    it('asks for nothing when given no ids', async () => {
      await expect(new ManagementService(credentials).getUsersByIds([])).resolves.toEqual(new Map());
      expect(apiRequests()).toHaveLength(0);
    });
  });

  describe('updateUserMetadata', () => {
    it('reads the user, then patches only what the filters allow, never the email', async () => {
      await new ManagementService(credentials).updateUserMetadata(
        'auth0|1',
        {
          user_info: { given_name: 'Augusta', family_name: 'King', email: 'changed@example.edu' } as never,
          app_metadata: { gisday: { checkins: 4 }, other: 'must not be written' },
          user_metadata: { education: 'MS', occupation: 'must not be written' }
        },
        { app_metadata: ['gisday'], user_metadata: ['education'] }
      );

      const [read, patch] = apiRequests();

      expect(`${read.method} ${read.path}`).toBe('GET /api/v2/users/auth0|1');
      expect(`${patch.method} ${patch.path}`).toBe('PATCH /api/v2/users/auth0|1');
      expect(patch.body).toEqual({
        given_name: 'Augusta',
        family_name: 'King',
        name: 'Augusta King',
        app_metadata: { gisday: { checkins: 4 } },
        user_metadata: { education: 'MS' }
      });
    });

    it("leaves a social user's name and email to the social provider", async () => {
      await new ManagementService(credentials).updateUserMetadata(
        'google-oauth2|2',
        {
          user_info: { given_name: 'G', family_name: 'H', email: 'x@example.edu' } as never,
          app_metadata: { gisday: { a: 1 } },
          user_metadata: {}
        },
        { app_metadata: '*', user_metadata: '*' }
      );

      expect(apiRequests()[1].body).toEqual({ app_metadata: { gisday: { a: 1 } } });
    });

    it('returns the updated user, mapped', async () => {
      const profile = await new ManagementService(credentials).updateUserMetadata(
        'auth0|1',
        { user_info: undefined as never, app_metadata: { gisday: { checkins: 9 } }, user_metadata: {} },
        { app_metadata: 'gisday', user_metadata: '*' }
      );

      expect(profile.app_metadata).toEqual({ gisday: { checkins: 9 } });
      expect(profile.user_info.id).toBe('auth0|1');
    });
  });

  describe('getUsers, with more users than one page holds (#2320)', () => {
    // 51 users: a first page of 50 and a second of 1. Named so that sorting by name is not the order they were added in.
    beforeEach(() => {
      users = Object.fromEntries(
        Array.from({ length: 51 }, (_, i) => {
          const id = `auth0|${i}`;
          return [id, { user_id: id, name: `User ${String(50 - i).padStart(2, '0')}` }];
        })
      );
    });

    it('lists all 51 users, not only the first 50', async () => {
      const profiles = await new ManagementService(credentials).getUsers();

      expect(profiles).toHaveLength(51);
    });

    it('keeps them sorted by name, across pages', async () => {
      const names = (await new ManagementService(credentials).getUsers()).map((p) => p.user_info.name);

      expect(names[0]).toBe('User 00');
      expect(names.at(-1)).toBe('User 50');
      expect(names).toEqual([...names].sort());
    });

    it('asks for each page in turn, and stops after the last', async () => {
      await new ManagementService(credentials).getUsers();

      expect(apiRequests().map((r) => r.query['page'])).toEqual(['0', '1']);
      expect(apiRequests().every((r) => r.query['sort'] === 'name:1' && r.query['per_page'] === '50')).toBe(true);
    });

    it('stops at 100 pages, and says so, however many pages the API offers', async () => {
      users = Object.fromEntries(
        Array.from({ length: 6000 }, (_, i) => [`auth0|${i}`, { user_id: `auth0|${i}`, name: `User ${i}` }])
      );
      const warn = vi.spyOn(Logger, 'warn').mockImplementation(() => undefined);

      const profiles = await new ManagementService(credentials).getUsers();

      expect(apiRequests()).toHaveLength(100);
      expect(profiles).toHaveLength(5000);
      expect(warn).toHaveBeenCalledWith('Stopped listing users after 100 pages (5000 users).', 'ManagementService');
      warn.mockRestore();
    });
  });

  describe('getUsers', () => {
    it('asks for the first page of 50, sorted by name, and no more when it is not full', async () => {
      await new ManagementService(credentials).getUsers();

      const [list] = apiRequests();

      expect(`${list.method} ${list.path}`).toBe('GET /api/v2/users');
      // The API's own defaults, stated: page 0, 50 to a page, with totals.
      expect(list.query).toEqual({ sort: 'name:1', page: '0', per_page: '50', include_totals: 'true' });
      expect(apiRequests()).toHaveLength(1);
    });

    it('maps every user on the page', async () => {
      const profiles = await new ManagementService(credentials).getUsers({ app_metadata: 'gisday', user_metadata: '*' });

      expect(profiles.map((p) => [p.user_info.id, p.user_info.connection, p.user_info.social])).toEqual([
        ['auth0|1', 'auth0', false],
        ['google-oauth2|2', 'google-oauth2', true]
      ]);
      expect(profiles[0].app_metadata).toEqual({ gisday: { checkins: 3 } });
    });
  });

  describe('getUsersCreatedBetween and countUsersCreatedBetween (#2892)', () => {
    const from = new Date('2025-11-21T06:00:00.000Z');
    const to = new Date('2026-11-21T06:00:00.000Z');

    beforeEach(() => {
      users = {};

      // Ten accounts a month apart from December 2025, all with a GIS Day profile but the third; one before the window.
      for (let i = 0; i < 10; i++) {
        const created = new Date(Date.UTC(2025, 11 + i, 15)).toISOString();

        users[`auth0|${i}`] = {
          user_id: `auth0|${i}`,
          name: `Person ${i}`,
          created_at: created,
          app_metadata: i === 2 ? {} : { gisday: { attendeeType: 'student' } }
        };
      }

      users['auth0|old'] = { user_id: 'auth0|old', name: 'Old', created_at: '2024-01-01T00:00:00.000Z', app_metadata: { gisday: {} } };
    });

    const searches = () => apiRequests().map((r) => r.query['q']);

    it('asks for the accounts made in the window, with ISO times and an end it does not include', async () => {
      await new ManagementService(credentials).getUsersCreatedBetween(from, to, '_exists_:app_metadata.gisday');

      expect(searches()[0]).toBe('created_at:[2025-11-21T06:00:00.000Z TO 2026-11-21T06:00:00.000Z} AND _exists_:app_metadata.gisday');
    });

    it('returns each account with a GIS Day profile in the window, oldest first, with when it was made', async () => {
      const found = await new ManagementService(credentials).getUsersCreatedBetween(from, to, '_exists_:app_metadata.gisday', {
        app_metadata: 'gisday',
        user_metadata: []
      });

      expect(found.map((f) => f.profile.user_info.id)).toEqual(['auth0|0', 'auth0|1', 'auth0|3', 'auth0|4', 'auth0|5', 'auth0|6', 'auth0|7', 'auth0|8', 'auth0|9']);
      expect(found[0].created).toBe('2025-12-15T00:00:00.000Z');
      expect(found[0].profile.app_metadata).toEqual({ gisday: { attendeeType: 'student' } });
    });

    it('splits a window that matches too many into halves, and halves again, so every account is read', async () => {
      const found = await new ManagementService(credentials).getUsersCreatedBetween(from, to, undefined, undefined, 3);

      expect(found).toHaveLength(10);
      expect(new Set(found.map((f) => f.profile.user_info.id)).size).toBe(10);
      expect(searches().length).toBeGreaterThan(2);
    });

    it('counts the accounts made in the window, profile or not, from the totals alone', async () => {
      const service = new ManagementService(credentials);

      expect(await service.countUsersCreatedBetween(from, to)).toBe(10);
      expect(apiRequests().every((r) => r.query['per_page'] === '1')).toBe(true);
      expect(await service.countUsersCreatedBetween(from, to, undefined, 3)).toBe(10);
    });
  });
});

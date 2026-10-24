import { InternalServerErrorException } from '@nestjs/common';

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

      // As the API answers: with include_totals, the page in an envelope; without it, a bare array.
      if (url.pathname === '/api/v2/users' && request.method === 'GET') {
        const all = Object.values(users);

        return url.searchParams.get('include_totals') === 'true'
          ? json(200, { start: 0, limit: 50, length: all.length, total: all.length, users: all })
          : json(200, all);
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

  describe('getUsers', () => {
    it('lists users sorted by name, the first page of 50, as auth0 3 did', async () => {
      await new ManagementService(credentials).getUsers();

      const [list] = apiRequests();

      expect(`${list.method} ${list.path}`).toBe('GET /api/v2/users');
      // auth0 7 states the API's own defaults, which auth0 3 left to the API: the same first page of 50.
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
});

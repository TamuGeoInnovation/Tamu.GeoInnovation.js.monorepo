import { ExecutionContext, INestApplication } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { JwtGuard, ManagementService, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { Organization, University, UserInfo } from '../entities/all.entity';
import { UserInfoController } from './user-info.controller';
import { UserInfoProvider } from './user-info.provider';
import { AccountDashboardProvider, AccountsRateLimitedException } from './account-dashboard.provider';

/**
 * `GET /users`, which Admin -> Users reads, through Nest's real routing, the real provider and the real
 * ManagementService. Only Auth0 is replaced: a fake Management API client holding 1,050 users, which refuses any page
 * past the first 1,000 as the tenant does. Production has more than 1,000 users, and the page answered 500 (#2574).
 */
describe('UserInfoController, GET /users (#2574)', () => {
  let app: INestApplication;
  let url: string;
  let listed: Array<Record<string, unknown>>;

  const all = Array.from({ length: 1050 }, (_, i) => ({
    user_id: `auth0|${i}`,
    name: i === 1040 ? 'User 1040 Zed' : `User ${String(i).padStart(4, '0')}`,
    email: `user${i}@example.edu`
  }));

  /** As auth0 7's users.list pages: 50 a page by default, and a refusal, as the tenant sends it, past 1,000. */
  const list = async (request: Record<string, unknown>) => {
    listed.push(request);

    const perPage = Number(request['per_page'] ?? 50);
    // From the start of a word, as Auth0's v3 search matches name:word* (#3116); it refuses a leading wildcard.
    const word = /\bname:([^*\s)]+)\*/.exec(String(request['q'] ?? ''))?.[1];
    const matches = word ? all.filter((u) => u.name.split(/\s+/).some((w) => w.startsWith(word))) : all;

    const load = async (index: number) => {
      if ((index + 1) * perPage > 1000) {
        throw Object.assign(new Error('BadRequestError'), {
          statusCode: 400,
          body: { statusCode: 400, error: 'Bad Request', errorCode: 'invalid_paging' }
        });
      }

      const users = matches.slice(index * perPage, (index + 1) * perPage);
      const page = {
        data: users,
        response: { start: index * perPage, limit: perPage, length: users.length, total: matches.length, users },
        hasNextPage: () => users.length > 0 && users.length >= perPage,
        getNextPage: () => load(index + 1)
      };

      return page;
    };

    return load(Number(request['page'] ?? 0));
  };

  beforeAll(async () => {
    const management = new ManagementService({ domain: 'tenant.example.com', clientId: 'c', clientSecret: 's' });
    Object.assign(management, { _client: { users: { list } } });

    const module = await Test.createTestingModule({
      controllers: [UserInfoController],
      providers: [
        UserInfoProvider,
        // Development's accounts dashboard (#2892), which this route does not use.
        { provide: AccountDashboardProvider, useValue: {} },
        { provide: ManagementService, useValue: management },
        { provide: getRepositoryToken(UserInfo), useValue: {} },
        { provide: getRepositoryToken(University), useValue: {} },
        { provide: getRepositoryToken(Organization), useValue: {} }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions: ['read:users'] };
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  beforeEach(() => {
    listed = [];
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers 200 with the first 1,000 users, and says the list is cut off', async () => {
    const response = await fetch(`${url}/users`);

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.users).toHaveLength(1000);
    expect(body.truncated).toBe(true);
    expect(body.users[0].user_info).toMatchObject({ id: 'auth0|0', name: 'User 0000', email: 'user0@example.edu' });
  });

  it('searches Auth0 for ?q=, and finds a user past the first 1,000', async () => {
    const response = await fetch(`${url}/users?q=Zed`);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      users: [{ user_info: { id: 'auth0|1040', name: 'User 1040 Zed' } }],
      truncated: false
    });
    expect(listed[0]).toMatchObject({
      q: '(name:Zed* OR given_name:Zed* OR family_name:Zed* OR email:Zed*)',
      search_engine: 'v3'
    });
  });

  it('is still guarded by a token and the read:users permission', () => {
    const handler = Object.getOwnPropertyDescriptor(UserInfoController.prototype, 'getAllUsers')?.value;

    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([JwtGuard, PermissionsGuard]);
    expect(Reflect.getMetadata('Permissions', handler)).toEqual([['read:users'], 'some']);
  });
});

/**
 * The accounts dashboard's two routes when Auth0 rate-limits the API (#3747): 503 with Retry-After, which the page reads to
 * say how long to wait, rather than the 500 they answered.
 */
describe('UserInfoController, the accounts dashboard when Auth0 rate-limits it (#3747)', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const limited = async () => {
      throw new AccountsRateLimitedException(12);
    };

    const module = await Test.createTestingModule({
      controllers: [UserInfoController],
      providers: [
        { provide: UserInfoProvider, useValue: {} },
        { provide: AccountDashboardProvider, useValue: { getSeason: limited, getRow: limited } }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions: ['read:users'] };
          return true;
        }
      })
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

  it.each(['dashboard/season/s-2026', 'dashboard/season/s-2026/row/esri'])(
    '/users/%s answers 503 with Retry-After',
    async (path) => {
      const response = await fetch(`${url}/users/${path}`);

      expect(response.status).toBe(503);
      expect(response.headers.get('retry-after')).toBe('12');
      expect((await response.json()).message).toMatch(/temporarily unavailable/i);
    }
  );
});

import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { SpeakerController } from './speaker.controller';
import { SpeakerProvider } from './speaker.provider';

/**
 * #441: the admin Speakers list shows each speaker's sessions, read from a route of its own behind `update:speakers`, as
 * the badges dashboard's list is. The public `season/:guid` route stays as it was: a session hidden from the public
 * schedule must not be named on it. Nest's real routing and `PermissionsGuard` run; only the token check is replaced.
 */
describe('SpeakerController, the speakers with their sessions (#441)', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;

  /** As the provider answers: a speaker's sessions only when asked for them. */
  const speakers = (withSessions?: boolean) => [
    { guid: 'sp-1', firstName: 'Ana', lastName: 'Ruiz', ...(withSessions ? { events: [{ guid: 'e-1', name: 'Hidden session' }] } : {}) }
  ];
  const provider = {
    getSpeakersForSeason: jest.fn(async (_guid: string, withSessions?: boolean) => speakers(withSessions)),
    getSpeakersForActiveSeason: jest.fn(async (withSessions?: boolean) => speakers(withSessions))
  };

  const get = (path: string) => fetch(`${url}/speakers/${path}`, { headers: { Origin: 'https://gisday.tamu.edu' } });

  beforeEach(async () => {
    permissions = [];
    provider.getSpeakersForSeason.mockClear();
    provider.getSpeakersForActiveSeason.mockClear();

    const module = await Test.createTestingModule({
      controllers: [SpeakerController],
      providers: [{ provide: SpeakerProvider, useValue: provider }]
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

  it("answers the public season list with no speaker's sessions", async () => {
    for (const path of ['season/s-1', 'season/active']) {
      const response = await get(path);

      expect(response.status).toBe(200);
      expect(JSON.stringify(await response.json())).not.toContain('events');
    }
  });

  it('refuses the list with sessions to anyone who cannot edit speakers', async () => {
    for (const held of [[], ['read:competitions'], ['update:events']]) {
      permissions = held;

      expect((await get('sessions/season/s-1')).status).toBe(403);
      expect((await get('sessions/season/active')).status).toBe(403);
    }
  });

  it("answers an admin who can edit speakers with each speaker's sessions", async () => {
    permissions = ['update:speakers'];

    const forSeason = await get('sessions/season/s-1');
    expect(forSeason.status).toBe(200);
    expect(await forSeason.json()).toEqual([expect.objectContaining({ guid: 'sp-1', events: [{ guid: 'e-1', name: 'Hidden session' }] })]);
    expect(provider.getSpeakersForSeason).toHaveBeenCalledWith('s-1', true);

    const forActive = await get('sessions/season/active');
    expect(forActive.status).toBe(200);
    expect(await forActive.json()).toEqual([expect.objectContaining({ events: [{ guid: 'e-1', name: 'Hidden session' }] })]);
    expect(provider.getSpeakersForActiveSeason).toHaveBeenCalledWith(true);
  });
});

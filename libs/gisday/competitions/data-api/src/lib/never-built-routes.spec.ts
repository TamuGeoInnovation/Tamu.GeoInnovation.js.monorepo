import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { LeaderboardController } from './leaderboard/leaderboard.controller';
import { LeaderboardService } from './leaderboard/leaderboard.service';
import { MapController } from './map/map.controller';
import { MapService } from './map/map.service';

/**
 * Routes that were never built and only answered 501 are gone (#3896, #1899): nothing called them, and a route that
 * can only fail is a trap (#3635). Through Nest's real routing, with the guards passed, so a route that still exists
 * answers rather than being refused at the door.
 */
describe('the competitions API without its never-built routes (#3896)', () => {
  let app: INestApplication;
  let url: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LeaderboardController, MapController],
      providers: [
        { provide: LeaderboardService, useValue: { getLeaderBoardItemsForActiveSeason: async () => [{ identity: 'a' }] } },
        { provide: MapService, useValue: { getLocationsForActiveSeason: async () => ({ type: 'FeatureCollection' }) } }
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

  it.each(['competitions/leaderboards', 'competitions/maps'])('has no GET %s', async (path) => {
    expect((await fetch(`${url}/${path}`)).status).toBe(404);
  });

  it('still answers the routes that work', async () => {
    expect(await (await fetch(`${url}/competitions/leaderboards/active`)).json()).toEqual([{ identity: 'a' }]);
    expect(await (await fetch(`${url}/competitions/maps/seasons/active`)).json()).toEqual({ type: 'FeatureCollection' });
  });
});

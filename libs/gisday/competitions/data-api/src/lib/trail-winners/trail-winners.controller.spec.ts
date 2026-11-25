import type { Mock } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';
import { DashboardProfilesService, SeasonWinnerService } from '@tamu-gisc/gisday/platform/data-api';

import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { TrailWinnersController } from './trail-winners.controller';
import { TrailWinnersProvider } from './trail-winners.provider';

/**
 * #3243: the trail challenge's winners on the Winners page. The admins pick 1st to 3rd from the season's submitters in the
 * leaderboard's order, each with their name from their profile and their points; the places are kept by account with
 * the research competitions' winners (#3239). Made-up people only.
 */
describe('TrailWinnersProvider (#3243)', () => {
  const SEASON = 'season-2026';
  const ranked = [
    { account: 'auth0|walker', points: 14 },
    { account: 'auth0|hiker', points: 9 },
    { account: 'auth0|nameless', points: 2 }
  ];
  const profiles = new Map<string, unknown>([
    ['auth0|walker', { user_info: { given_name: 'Riley', family_name: 'Walker', email: 'riley@example.org' } }],
    ['auth0|hiker', { user_info: { name: 'Quinn Hiker', email: 'quinn@example.org' } }],
    ['auth0|nameless', null]
  ]);

  let leaderboard: { rankedForSeason: Mock };
  let winners: { trailPlaces: Mock; saveTrail: Mock };
  let provider: TrailWinnersProvider;

  beforeEach(() => {
    leaderboard = { rankedForSeason: vi.fn(async () => ranked) };
    winners = {
      trailPlaces: vi.fn(async () => [{ place: 1, account: 'auth0|walker' }]),
      saveTrail: vi.fn(async () => [])
    };
    provider = new TrailWinnersProvider(
      leaderboard as unknown as LeaderboardService,
      winners as unknown as SeasonWinnerService,
      {
        profilesOf: async (accounts: Array<string>) => new Map(accounts.map((a) => [a, profiles.get(a)]))
      } as never as DashboardProfilesService
    );
  });

  it("offers the season's submitters in the leaderboard's order, with name and points, and the places picked", async () => {
    const page = await provider.forSeason(SEASON);

    expect(leaderboard.rankedForSeason).toHaveBeenCalledWith(SEASON);
    expect(page).toEqual({
      entries: [
        { account: 'auth0|walker', name: 'Riley Walker', points: 14 },
        { account: 'auth0|hiker', name: 'Quinn Hiker', points: 9 },
        { account: 'auth0|nameless', name: null, points: 2 }
      ],
      winners: [{ place: 1, account: 'auth0|walker' }]
    });
    expect(JSON.stringify(page)).not.toContain('example.org');
  });

  it('saves only from the leaderboard: its accounts are the ones a place may name', async () => {
    const body = { winners: [{ place: 1, account: 'auth0|walker' }] };

    await provider.save(SEASON, body);

    expect(winners.saveTrail).toHaveBeenCalledWith(SEASON, body, new Set(ranked.map((r) => r.account)));
  });

  it.each([
    ['forSeason', 'read:competitions'],
    ['save', 'update:competitions']
  ] as const)('keeps %s behind a token and %s', (name, permission) => {
    const handler = TrailWinnersController.prototype[name];

    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
    expect(Reflect.getMetadata('Permissions', handler)[0]).toEqual([permission]);
    expect(Reflect.getMetadata('AllowAny', handler)).toBeUndefined();
  });
});

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { VgiDashboardProvider } from './vgi-dashboard.provider';

/**
 * #2894: the VGI submissions dashboard counts a season's submissions by the feature type chosen on its form, scored as the
 * leaderboard scores them (a new find or a repeat), with the people who made them and their review status.
 */
describe('VgiDashboardProvider (#2894)', () => {
  // About 1 metre in degrees of latitude.
  const metre = 1 / 111195;
  const here = { latitude: 30.6122, longitude: -96.3414 };
  const north = (metres: number) => ({ latitude: here.latitude + metres * metre, longitude: here.longitude });
  const far = north(5000);

  const form = {
    model: [
      {
        attribute: 'kind',
        isDiscriminator: true,
        options: [
          { name: 'Monument', value: 'monument' },
          { name: 'Plaque', value: 'plaque' }
        ]
      }
    ]
  };

  let n = 0;
  const submission = (
    user: string,
    location: { latitude: number; longitude: number },
    kind: string | undefined,
    status?: COMPETITION_VALIDATION_STATUS
  ) => ({
    guid: `sub-${++n}`,
    created: new Date(Date.UTC(2026, 10, 14, 15, n)),
    userGuid: `auth0|${user}`,
    value: kind === undefined ? {} : { kind },
    location: { latitude: location.latitude.toFixed(5), longitude: location.longitude.toFixed(5) },
    validationStatus: status ? { status } : null
  });

  let submissions: Array<ReturnType<typeof submission>>;
  let provider: VgiDashboardProvider;
  let profilesOf: jest.Mock;

  beforeEach(() => {
    n = 0;
    submissions = [
      // Ann finds the monument; Bob submits it again a few metres away: a repeat, as the leaderboard scores it.
      submission('ann', here, 'monument'),
      submission('bob', north(4), 'monument', COMPETITION_VALIDATION_STATUS.verified),
      // A plaque far off is a new find of its own type.
      submission('ann', far, 'plaque'),
      // Discarded: neither a new find nor a repeat, but still a submission.
      submission('cat', north(8000), 'monument', COMPETITION_VALIDATION_STATUS.discarded),
      // No type chosen.
      submission('dan', north(9000), undefined)
    ];

    const competitionSeason = { guid: 'cs-1', form, season: { guid: 's-1', year: 2026 } };
    const compSeasonRepo = { findOne: jest.fn(() => Promise.resolve(competitionSeason)), find: jest.fn(() => []) };
    const leaderboard = new LeaderboardService(
      { find: jest.fn(() => Promise.resolve(submissions)) } as never,
      undefined,
      undefined,
      compSeasonRepo as never,
      undefined,
      undefined
    );

    profilesOf = jest.fn((accounts: Array<string>) =>
      Promise.resolve(
        new Map(
          accounts.map((a) => [
            a,
            a === 'auth0|ann'
              ? {
                  user_info: { email: 'ann@example.edu', given_name: 'Ann', family_name: 'Lee' },
                  app_metadata: { gisday: { attendeeType: 'industry' } }
                }
              : null
          ])
        )
      )
    );

    provider = new VgiDashboardProvider(compSeasonRepo as never, leaderboard, {
      profilesOf,
      organizationNames: jest.fn(() => Promise.resolve(new Map()))
    } as never);
  });

  it("gives a row per feature type on the season's form, scored as the leaderboard scores, and one for no type", async () => {
    const dashboard = await provider.getSeason('s-1');

    expect(dashboard.season).toBe('s-1');
    // Each person once, whatever types they submitted: Ann, Bob, Cat and Dan.
    expect(dashboard.people).toBe(4);
    expect(dashboard.events.map((row) => [row.guid, row.name, row.total, row.counts])).toEqual([
      ['monument', 'Monument', 3, { newFinds: 1, repeats: 1, people: 3, unverified: 1, verified: 1, discarded: 1 }],
      ['plaque', 'Plaque', 1, { newFinds: 1, repeats: 0, people: 1, unverified: 1, verified: 0, discarded: 0 }],
      ['none', 'No type chosen', 1, { newFinds: 1, repeats: 0, people: 1, unverified: 1, verified: 0, discarded: 0 }]
    ]);
  });

  it('says when each submission was made, by its type, for the chart', async () => {
    const dashboard = await provider.getSeason('s-1');

    expect(dashboard.made.map((m) => m.event)).toEqual(['monument', 'monument', 'plaque', 'monument', 'none']);
    expect(dashboard.made[0].created).toBe('2026-11-14T15:01:00.000Z');
  });

  it('lists a type with no submissions with zeros, and a season with no competition as empty', async () => {
    submissions = [];
    expect((await provider.getSeason('s-1')).events.map((row) => [row.guid, row.total])).toEqual([
      ['monument', 0],
      ['plaque', 0]
    ]);

    const none = new VgiDashboardProvider({ findOne: jest.fn(() => Promise.resolve(null)) } as never, undefined, undefined);
    expect(await none.getSeason('s-2')).toEqual({ season: 's-2', people: 0, events: [], made: [], unreadAccounts: 0 });
  });

  it("lists a type's submitters with their counts, from their profiles", async () => {
    const people = await provider.getType('s-1', 'monument');

    expect(profilesOf).toHaveBeenCalledWith(['auth0|ann', 'auth0|bob', 'auth0|cat']);
    expect(people.map((p) => [p.email, p.type, p.counts, p.created])).toEqual([
      ['ann@example.edu', 'industry', { submissions: 1, newFinds: 1, repeats: 0 }, '2026-11-14T15:01:00.000Z'],
      [null, 'not-given', { submissions: 1, newFinds: 0, repeats: 1 }, '2026-11-14T15:02:00.000Z'],
      [null, 'not-given', { submissions: 1, newFinds: 0, repeats: 0 }, '2026-11-14T15:04:00.000Z']
    ]);
  });
});

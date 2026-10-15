import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import { ALREADY_SUBMITTED_POINTS, LeaderboardService, NEW_FIND_POINTS } from './leaderboard.service';

describe('LeaderboardService', () => {
  // About 1 metre in degrees of latitude.
  const metre = 1 / 111195;
  const monument = { latitude: 30.6122, longitude: -96.3414 };
  const north = (metres: number) => ({ latitude: monument.latitude + metres * metre, longitude: monument.longitude });

  // The 2026 form's type question, used to tell kinds of thing apart.
  const form = {
    model: [{ attribute: 'kind', isDiscriminator: true, options: [{ name: 'Monument', value: 'monument', points: 5 }] }]
  };

  let submissions: Array<unknown>;
  let seasonForm: unknown;
  let service: LeaderboardService;
  let find: jest.Mock;

  /**
   * A submission as the database returns it: decimals as text, oldest first.
   */
  const submission = (
    user: string,
    location: { latitude: number; longitude: number } | null,
    kind = 'monument',
    status?: string
  ) => ({
    userGuid: `auth0|${user}`,
    value: { kind },
    location: location ? { latitude: location.latitude.toFixed(5), longitude: location.longitude.toFixed(5) } : null,
    validationStatus: status ? { status } : null
  });

  const scores = async () => {
    const board = await service.getLeaderBoardItemsForActiveSeason();

    return Object.fromEntries(board.map((row) => [row.guid.replace('auth0|', ''), row.points]));
  };

  beforeEach(() => {
    submissions = [];
    seasonForm = form;
    find = jest.fn(() => Promise.resolve(submissions));

    service = new LeaderboardService(
      { find } as never,
      undefined,
      undefined,
      { findOne: jest.fn(() => Promise.resolve({ guid: 'cs-1', form: seasonForm })) } as never,
      { findOne: jest.fn(() => Promise.resolve({ guid: 's-1', active: true })) } as never,
      undefined
    );
  });

  it('scores 2 for the first submission of a thing and 1 for a later one by someone else', async () => {
    submissions = [submission('ann', monument), submission('bob', north(5))];

    expect(await scores()).toEqual({ ann: NEW_FIND_POINTS, bob: ALREADY_SUBMITTED_POINTS });
    expect(NEW_FIND_POINTS).toBe(2);
    expect(ALREADY_SUBMITTED_POINTS).toBe(1);
  });

  it('scores 1 when the first submitter submits the same thing again', async () => {
    submissions = [submission('ann', monument), submission('ann', north(3))];

    expect(await scores()).toEqual({ ann: 3 });
  });

  it('compares submissions oldest first', async () => {
    submissions = [submission('ann', monument), submission('bob', north(2))];
    await scores();

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ order: { created: 'ASC' } }));
  });

  it('scores 2 for a different kind of thing at the same spot', async () => {
    submissions = [submission('ann', monument, 'monument'), submission('bob', monument, 'plaque')];

    expect(await scores()).toEqual({ ann: 2, bob: 2 });
  });

  it('scores 2 for the same kind of thing more than 15 m away', async () => {
    submissions = [submission('ann', monument), submission('bob', north(20))];

    expect(await scores()).toEqual({ ann: 2, bob: 2 });
  });

  it('counts a thing as already submitted if any earlier submission is close, not only the first', async () => {
    // Bob is 12 m from Ann (already submitted). Cat is 22 m from Ann but 10 m from Bob.
    submissions = [submission('ann', monument), submission('bob', north(12)), submission('cat', north(22))];

    expect(await scores()).toEqual({ ann: 2, bob: 1, cat: 1 });
  });

  it('ignores a discarded earlier submission, so the next one is the first', async () => {
    submissions = [
      submission('ann', monument, 'monument', COMPETITION_VALIDATION_STATUS.discarded),
      submission('bob', north(2), 'monument', COMPETITION_VALIDATION_STATUS.verified)
    ];

    expect(await scores()).toEqual({ bob: 2 });
  });

  it('scores 1 for a submission with no usable location, and does not let it block a later one', async () => {
    submissions = [submission('ann', null), submission('bob', { latitude: 0, longitude: 0 }), submission('cat', monument)];

    expect(await scores()).toEqual({ ann: 1, bob: 1, cat: 2 });
  });

  it('ignores the per-answer points the type question used to give', async () => {
    submissions = [submission('ann', monument)];

    // The form's option is worth 5 under the old scoring.
    expect(await scores()).toEqual({ ann: 2 });
  });

  it('compares by distance alone when the form has no type question', async () => {
    seasonForm = { model: [{ attribute: 'kind', options: [] }] };
    submissions = [submission('ann', monument, 'monument'), submission('bob', north(4), 'plaque')];

    expect(await scores()).toEqual({ ann: 2, bob: 1 });
  });

  it('ranks people by their total, highest first', async () => {
    submissions = [submission('ann', monument), submission('bob', north(100)), submission('bob', north(200)), submission('cat', north(2))];

    const board = await service.getLeaderBoardItemsForActiveSeason();

    expect(board.map((row) => [row.guid, row.points])).toEqual([
      ['auth0|bob', 4],
      ['auth0|ann', 2],
      ['auth0|cat', 1]
    ]);
  });
});

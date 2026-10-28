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
  let findCompetitionSeason: jest.Mock;

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
    findCompetitionSeason = jest.fn(() => Promise.resolve({ guid: 'cs-1', form: seasonForm }));

    service = new LeaderboardService(
      { find } as never,
      undefined,
      undefined,
      { findOne: findCompetitionSeason } as never,
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

  it('compares submissions oldest first, and two made in the same instant in a fixed order', async () => {
    submissions = [submission('ann', monument), submission('bob', north(2))];
    await scores();

    expect(find).toHaveBeenCalledWith(expect.objectContaining({ order: { created: 'ASC', guid: 'ASC' } }));
  });

  it('scores 2 for a different kind of thing at the same spot', async () => {
    submissions = [submission('ann', monument, 'monument'), submission('bob', monument, 'plaque')];

    expect(await scores()).toEqual({ ann: 2, bob: 2 });
  });

  it('scores 2 for the same kind of thing more than 15 m away', async () => {
    submissions = [submission('ann', monument), submission('bob', north(20))];

    expect(await scores()).toEqual({ ann: 2, bob: 2 });
  });

  it('compares a submission only with earlier new finds, so already-submitted ones do not chain', async () => {
    // Bob is 12 m from Ann's new find, so already submitted. Cat is 22 m from Ann and 10 m from Bob:
    // Bob's was not a new find, so Cat's is.
    submissions = [submission('ann', monument), submission('bob', north(12)), submission('cat', north(22))];

    expect(await scores()).toEqual({ ann: 2, bob: 1, cat: 2 });
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

  /**
   * #2162: the 2026 Monument Trail Challenge. A thing documented in 2025 scores 1, and plaques, which sit a
   * few metres apart, are told apart by the name on them.
   */
  describe('with the 2026 form', () => {
    // As the 2026 form schema configures them: plaques within 10 m are the same only when their names
    // match, and against 2025, which has no names, only within 3 m; monuments within 15 m, as before.
    const form2026 = {
      model: [
        {
          attribute: 'memorial_type',
          isDiscriminator: true,
          options: [
            { name: 'Monument', value: 'monument', earlier: { values: ['statues_monuments'], metres: 15 } },
            { name: 'Memorial marker', value: 'memorial_marker' },
            {
              name: 'Tree or bench memorial plaque',
              value: 'tree_bench_plaque',
              sameThingMetres: 10,
              nameAttribute: 'memorial_name',
              earlier: { values: ['tree_bench_plaque'], metres: 3 }
            }
          ]
        },
        { attribute: 'memorial_name', type: 'text', options: [] }
      ]
    };
    const form2025 = {
      model: [
        {
          attribute: 'art_type',
          isDiscriminator: true,
          options: [
            { name: 'Unknown Art Piece', value: 'unknown' },
            { name: 'Statue or Monument', value: 'statues_monuments' },
            { name: 'Tree or Bench Plaque', value: 'tree_bench_plaque' }
          ]
        }
      ]
    };

    let earlier: Array<unknown>;
    let findSeasons: jest.Mock;

    const find2026 = (user: string, location: { latitude: number; longitude: number }, kind: string, name?: string) => ({
      ...submission(user, location),
      value: { memorial_type: kind, memorial_name: name }
    });
    const found2025 = (location: { latitude: number; longitude: number }, kind: string, status?: string) => ({
      ...submission('class-of-2025', location, undefined, status),
      value: { art_type: kind }
    });

    beforeEach(() => {
      earlier = [];
      find = jest.fn((options) => Promise.resolve(options.where.season.guid === 'cs-2025' ? earlier : submissions));
      findCompetitionSeason = jest.fn(() => Promise.resolve({ guid: 'cs-2026', form: form2026, season: { year: 2026 } }));
      findSeasons = jest.fn(() =>
        Promise.resolve([
          { guid: 'cs-2024', form: { model: [] }, season: { year: 2024 } },
          { guid: 'cs-2025', form: form2025, season: { year: 2025 } },
          { guid: 'cs-2026', form: form2026, season: { year: 2026 } }
        ])
      );

      service = new LeaderboardService(
        { find } as never,
        undefined,
        undefined,
        { findOne: findCompetitionSeason, find: findSeasons } as never,
        { findOne: jest.fn(() => Promise.resolve({ guid: 's-2026', active: true, year: 2026 })) } as never,
        undefined
      );
    });

    it('scores 1 for a plaque documented in 2025, found again in 2026', async () => {
      earlier = [found2025(monument, 'tree_bench_plaque')];
      submissions = [find2026('ann', north(2), 'tree_bench_plaque', 'John Smith')];

      expect(await scores()).toEqual({ ann: 1 });
      expect(find).toHaveBeenCalledWith(expect.objectContaining({ where: { season: { guid: 'cs-2025' } } }));
    });

    it('scores 2 for a plaque 4.5 m from a 2025 plaque, the usual spacing on Military Walk', async () => {
      earlier = [found2025(monument, 'tree_bench_plaque')];
      submissions = [find2026('ann', north(4.5), 'tree_bench_plaque', 'John Smith')];

      expect(await scores()).toEqual({ ann: 2 });
    });

    it('scores 1 for a monument within 15 m of a 2025 statue or monument', async () => {
      earlier = [found2025(monument, 'statues_monuments')];
      submissions = [find2026('ann', north(12), 'monument', 'Aggie Bonfire Memorial')];

      expect(await scores()).toEqual({ ann: 1 });
    });

    it('does not count 2025 art, a 2025 discarded submission, or a 2025 thing of another type', async () => {
      earlier = [
        found2025(monument, 'unknown'),
        found2025(north(30), 'tree_bench_plaque', COMPETITION_VALIDATION_STATUS.discarded),
        found2025(north(60), 'statues_monuments')
      ];
      submissions = [
        find2026('ann', monument, 'monument', 'A'),
        find2026('bob', north(30), 'tree_bench_plaque', 'John Smith'),
        find2026('cat', north(60), 'tree_bench_plaque', 'Jane Doe')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 2, cat: 2 });
    });

    it('counts an unreviewed 2025 submission as well as a verified one', async () => {
      earlier = [
        found2025(monument, 'tree_bench_plaque', COMPETITION_VALIDATION_STATUS.unverified),
        found2025(north(50), 'tree_bench_plaque', COMPETITION_VALIDATION_STATUS.verified)
      ];
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(50), 'tree_bench_plaque', 'Jane Doe')
      ];

      expect(await scores()).toEqual({ ann: 1, bob: 1 });
    });

    it('compares with the latest earlier season only, not with every one', async () => {
      submissions = [find2026('ann', monument, 'monument', 'A')];
      await scores();

      expect(find).not.toHaveBeenCalledWith(expect.objectContaining({ where: { season: { guid: 'cs-2024' } } }));
    });

    it('tells two 2026 plaques 4.5 m apart apart by their names', async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(4.5), 'tree_bench_plaque', 'Jane Doe')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 2 });
    });

    it('scores 1 for the same plaque found again in 2026, its name typed differently', async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'In loving memory of John A. Smith'),
        find2026('bob', north(8), 'tree_bench_plaque', 'john a smith')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 1 });
    });

    it('scores 2 for a plaque with the same name more than 10 m away', async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(12), 'tree_bench_plaque', 'John Smith')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 2 });
    });

    it('compares a 2026 plaque with no name by distance alone', async () => {
      submissions = [find2026('ann', monument, 'tree_bench_plaque', 'John Smith'), find2026('bob', north(6), 'tree_bench_plaque', '')];

      expect(await scores()).toEqual({ ann: 2, bob: 1 });
    });

    it('still scores monuments by distance and type alone, whatever name was typed', async () => {
      submissions = [
        find2026('ann', monument, 'monument', 'Bonfire Memorial'),
        find2026('bob', north(10), 'monument', 'Aggie Bonfire Memorial Spirit Ring')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 1 });
    });

    // #2424 review: a name of only a plaque's own wording, or in a script the matcher cannot read, is no
    // name, so the plaque is judged by distance as one with no name is.
    it('compares a plaque whose name is only wording, or unreadable, by distance alone', async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(4), 'tree_bench_plaque', 'In loving memory'),
        find2026('cat', north(6), 'tree_bench_plaque', 'Dr.'),
        find2026('dan', north(8), 'tree_bench_plaque', '王小明')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 1, cat: 1, dan: 1 });
    });

    // #2424 review, decided 26 October: one person retyping a plaque's name does not make it new.
    it("scores 1 for a participant's own second submission of a plaque nearby, whatever name they type", async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('ann', north(3), 'tree_bench_plaque', 'Smith'),
        find2026('ann', north(5), 'tree_bench_plaque', 'J. Smith')
      ];

      expect(await scores()).toEqual({ ann: 4 });
    });

    it("scores 1 for a participant's retyped plaque even when their first one only matched someone else's", async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(2), 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(3), 'tree_bench_plaque', 'Jonathan Smithers')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 2 });
    });

    it('still scores different people with different names at neighbouring plaques separately', async () => {
      submissions = [
        find2026('ann', monument, 'tree_bench_plaque', 'John Smith'),
        find2026('bob', north(3), 'tree_bench_plaque', 'Jane Doe')
      ];

      expect(await scores()).toEqual({ ann: 2, bob: 2 });
    });
  });

  /**
   * #2474: only submissions made inside the season's scoring window count. The 2026 window opens at
   * 00:00 Central on 14 November and closes at 11:00 Central on 20 November.
   */
  describe('with a scoring window', () => {
    const opens = new Date('2026-11-14T06:00:00Z');
    const closes = new Date('2026-11-20T17:00:00Z');
    const at = (when: Date, user: string, location = monument) => ({ ...submission(user, location), created: when });
    const ms = (date: Date, offset: number) => new Date(date.getTime() + offset);

    beforeEach(() => {
      findCompetitionSeason.mockResolvedValue({ guid: 'cs-1', form: seasonForm, scoringOpensAt: opens, scoringClosesAt: closes });
    });

    it('counts a submission made at the moment the window opens, and not one a millisecond before', async () => {
      submissions = [at(ms(opens, -1), 'ann', north(100)), at(opens, 'bob', north(200))];

      expect(await scores()).toEqual({ bob: 2 });
    });

    it('counts a submission made a millisecond before the window closes, and not one at the moment it closes', async () => {
      submissions = [at(ms(closes, -1), 'ann', north(100)), at(closes, 'bob', north(200))];

      expect(await scores()).toEqual({ ann: 2 });
    });

    it('does not let a submission made before the window opens make a later one already found', async () => {
      submissions = [at(ms(opens, -60000), 'ann'), at(ms(opens, 60000), 'bob', north(3))];

      expect(await scores()).toEqual({ bob: 2 });
    });

    it('reads dates the database returns as text', async () => {
      findCompetitionSeason.mockResolvedValue({
        guid: 'cs-1',
        form: seasonForm,
        scoringOpensAt: opens.toISOString(),
        scoringClosesAt: closes.toISOString()
      });
      submissions = [{ ...at(ms(closes, 1), 'ann'), created: ms(closes, 1).toISOString() }, at(ms(opens, 1), 'bob', north(100))];

      expect(await scores()).toEqual({ bob: 2 });
    });

    it('has no limit on a side whose setting is empty, so earlier seasons score as before', async () => {
      findCompetitionSeason.mockResolvedValue({ guid: 'cs-1', form: seasonForm, scoringOpensAt: null, scoringClosesAt: closes });
      submissions = [at(new Date('2020-01-01T00:00:00Z'), 'ann'), at(closes, 'bob', north(100))];

      expect(await scores()).toEqual({ ann: 2 });
    });
  });

  it('scores a season named by its guid the same way as the active one', async () => {
    submissions = [submission('ann', monument), submission('bob', north(5)), submission('bob', north(40))];

    const board = await service.getLeaderBoardItemsForSeason('cs-1');

    expect(findCompetitionSeason).toHaveBeenCalledWith(expect.objectContaining({ where: { guid: 'cs-1' } }));
    expect(board.map((row) => [row.guid, row.points])).toEqual([
      ['auth0|bob', 3],
      ['auth0|ann', 2]
    ]);
  });
});

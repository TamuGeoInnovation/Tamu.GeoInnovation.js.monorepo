import { DataSource } from 'typeorm';

import { queryCheckingDataSource, queryCheckingRepository, Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission, GISDAY_COMPETITIONS_ENTITIES } from '../entities/all.entities';
import { LeaderboardService } from './leaderboard.service';

// The leaderboard's queries as typeorm builds them, with the real entities (#2424 review).
// leaderboard.service.spec.ts mocks the repositories, so it cannot see a where clause typeorm refuses.
describe('LeaderboardService queries, built by typeorm', () => {
  const form = {
    model: [
      {
        attribute: 'memorial_type',
        isDiscriminator: true,
        options: [
          {
            name: 'Tree or bench memorial plaque',
            value: 'tree_bench_plaque',
            earlier: { values: ['tree_bench_plaque'], metres: 3 }
          }
        ]
      }
    ]
  };

  let dataSource: DataSource;
  let service: LeaderboardService;
  let submissionFinds: Array<unknown>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  beforeEach(() => {
    const submissionRepo = queryCheckingRepository(dataSource, CompetitionSubmission);
    const compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);
    const seasonRepo = queryCheckingRepository(dataSource, Season);

    // Each read still builds its SQL first; these answer with rows so the scoring runs to the end.
    const buildSeason = compSeasonRepo.findOne.bind(compSeasonRepo);
    compSeasonRepo.findOne = async (options) => (
      await buildSeason(options),
      Object.assign(new CompetitionSeason(), { guid: 'cs-2026', form, season: { year: 2026 } })
    );
    const buildSeasons = compSeasonRepo.find.bind(compSeasonRepo);
    compSeasonRepo.find = async (options) => (
      await buildSeasons(options),
      [
        Object.assign(new CompetitionSeason(), {
          guid: 'cs-2025',
          form: { model: [{ attribute: 'art_type', isDiscriminator: true }] },
          season: { year: 2025 }
        })
      ]
    );
    const buildSubmissions = submissionRepo.find.bind(submissionRepo);
    submissionFinds = [];
    submissionRepo.find = async (options) => (await buildSubmissions(options), submissionFinds.push(options), []);

    const buildActive = seasonRepo.findOne.bind(seasonRepo);
    seasonRepo.findOne = async (options) => (
      await buildActive(options),
      Object.assign(new Season(), { guid: 's-2026', active: true })
    );

    service = new LeaderboardService(submissionRepo, undefined, undefined, compSeasonRepo, seasonRepo, undefined);
  });

  it("builds the active season's leaderboard, and the previous season's finds, without typeorm refusing a query", async () => {
    await expect(service.getLeaderBoardItemsForActiveSeason()).resolves.toEqual([]);

    expect(submissionFinds).toEqual([
      expect.objectContaining({ where: { season: { guid: 'cs-2026' } } }),
      expect.objectContaining({ where: { season: { guid: 'cs-2025' } } })
    ]);
  });

  it('builds a season named by its guid the same way', async () => {
    await expect(service.getLeaderBoardItemsForSeason('cs-2026')).resolves.toEqual([]);
  });
});

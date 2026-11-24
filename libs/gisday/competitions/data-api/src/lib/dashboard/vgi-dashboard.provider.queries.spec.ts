import { DataSource, Repository } from 'typeorm';

import { queryCheckingDataSource, queryCheckingRepository, Season } from '@tamu-gisc/gisday/platform/data-api';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  GISDAY_COMPETITIONS_ENTITIES
} from '../entities/all.entities';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { VgiDashboardProvider } from './vgi-dashboard.provider';

/**
 * The VGI dashboard's queries as typeorm builds them, with the real entities (#2363), the leaderboard's scoring included.
 * vgi-dashboard.provider.spec.ts mocks the repositories, so it cannot see a where clause typeorm refuses, such as one
 * holding a loaded row with a `null` column. The loaded rows here have their nullable columns `null`, as they come from
 * the database.
 */
describe('VgiDashboardProvider queries, built by typeorm', () => {
  const form = {
    model: [
      {
        attribute: 'memorial_type',
        isDiscriminator: true,
        options: [{ name: 'Plaque', value: 'plaque', earlier: { values: ['plaque'], metres: 3 } }]
      }
    ]
  };

  let dataSource: DataSource;
  let compSeasonRepo: Repository<CompetitionSeason>;
  let provider: VgiDashboardProvider;

  const compSeason = (year: number) =>
    Object.assign(new CompetitionSeason(), {
      guid: `cs-${year}`,
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: null,
      season: Object.assign(new Season(), {
        guid: `s-${year}`,
        year,
        active: year === 2026,
        posterSubmissionsCloseAt: null,
        paperFilesCloseAt: null
      }),
      form: Object.assign(new CompetitionForm(), { guid: `f-${year}`, source: '', ...form })
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  beforeEach(() => {
    compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);

    // Each read still builds its SQL first; these answer with the loaded seasons, so the scoring runs to the end.
    const buildSeason = compSeasonRepo.findOne.bind(compSeasonRepo);
    compSeasonRepo.findOne = async (options) => (await buildSeason(options), compSeason(2026));
    const buildSeasons = compSeasonRepo.find.bind(compSeasonRepo);
    compSeasonRepo.find = async (options) => (await buildSeasons(options), [compSeason(2025)]);

    const leaderboard = new LeaderboardService(
      queryCheckingRepository(dataSource, CompetitionSubmission),
      null as never,
      null as never,
      compSeasonRepo,
      null as never,
      null as never
    );

    provider = new VgiDashboardProvider(compSeasonRepo, leaderboard, {
      profilesOf: async () => new Map(),
      organizationNames: async () => new Map()
    } as never);
  });

  it("counts a season's submissions by type, scored by the leaderboard", async () => {
    await expect(provider.getSeason('s-2026')).resolves.toMatchObject({ season: 's-2026', people: 0, made: [] });
  });

  it("lists one type's submitters in a season", async () => {
    await expect(provider.getType('s-2026', 'plaque')).resolves.toEqual([]);
  });
});

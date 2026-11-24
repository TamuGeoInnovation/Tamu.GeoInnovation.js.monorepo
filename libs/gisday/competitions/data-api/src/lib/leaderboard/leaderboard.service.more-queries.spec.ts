import { DataSource, Repository } from 'typeorm';

import { queryCheckingDataSource, queryCheckingRepository, Season } from '@tamu-gisc/gisday/platform/data-api';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  GISDAY_COMPETITIONS_ENTITIES
} from '../entities/all.entities';
import { LeaderboardService, previousSeasonFinds } from './leaderboard.service';

/**
 * The rest of the leaderboard's queries as typeorm builds them (#2363); leaderboard.service.queries.spec.ts has the
 * leaderboards themselves. These take loaded competition seasons, with their nullable columns `null` as they come from
 * the database, and an earlier competition season whose GIS Day season is gone (`season` null).
 */
describe('LeaderboardService, more queries built by typeorm', () => {
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
  let submissionRepo: Repository<CompetitionSubmission>;
  let compSeasonRepo: Repository<CompetitionSeason>;
  let service: LeaderboardService;

  const compSeason = (year: number | null) =>
    Object.assign(new CompetitionSeason(), {
      guid: `cs-${year}`,
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: null,
      season:
        year === null
          ? null
          : Object.assign(new Season(), {
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
    submissionRepo = queryCheckingRepository(dataSource, CompetitionSubmission);
    compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);

    // Each read still builds its SQL first; these answer with loaded seasons, so the scoring runs to the end.
    const buildSeason = compSeasonRepo.findOne.bind(compSeasonRepo);
    compSeasonRepo.findOne = async (options) => (await buildSeason(options), compSeason(2026));
    const buildSeasons = compSeasonRepo.find.bind(compSeasonRepo);
    compSeasonRepo.find = async (options) => (await buildSeasons(options), [compSeason(2025), compSeason(null)]);

    service = new LeaderboardService(submissionRepo, null as never, null as never, compSeasonRepo, null as never, null as never);
  });

  it("ranks a GIS Day season's participants for the Winners page", async () => {
    await expect(service.rankedForSeason('s-2026')).resolves.toEqual([]);
  });

  it('scores a loaded competition season with no scoring window', async () => {
    await expect(service.scoreSubmissions(compSeason(2026))).resolves.toEqual([]);
  });

  it("reads the previous season's finds for a loaded competition season", async () => {
    await expect(previousSeasonFinds(compSeasonRepo, submissionRepo, compSeason(2026))).resolves.toEqual({
      year: 2025,
      finds: []
    });
  });
});

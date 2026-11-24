import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import {
  queryCheckingDataSource,
  queryCheckingRepository,
  recordWrites,
  Season
} from '@tamu-gisc/gisday/platform/data-api';

import {
  CompetitionForm,
  CompetitionSeason,
  CompetitionSubmission,
  GISDAY_COMPETITIONS_ENTITIES
} from '../entities/all.entities';
import { MapService } from './map.service';

/**
 * The competition map's queries as typeorm builds them, with the real entities (#2363). map.service.spec.ts mocks the
 * repositories, so it cannot see a query typeorm refuses, such as a where clause holding a loaded row with a `null`
 * column. The loaded rows here have their nullable columns `null`, as they come from the database. The locations are read
 * with the query builder, so its SQL is recorded (`recordWrites`) rather than sent.
 */
describe('MapService queries, built by typeorm', () => {
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
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;
  let submissionRepo: Repository<CompetitionSubmission>;
  let seasonRepo: Repository<Season>;
  let compSeasonRepo: Repository<CompetitionSeason>;
  let service: MapService;

  const season = (year: number) =>
    Object.assign(new Season(), {
      guid: `s-${year}`,
      year,
      active: year === 2026,
      posterSubmissionsCloseAt: null,
      paperFilesCloseAt: null
    });

  const compSeason = (year: number) =>
    Object.assign(new CompetitionSeason(), {
      guid: `cs-${year}`,
      allowSubmissions: true,
      scoringOpensAt: null,
      scoringClosesAt: null,
      season: season(year),
      form: Object.assign(new CompetitionForm(), { guid: `f-${year}`, source: '', ...form })
    });

  /** Makes `repo.findOne` answer with `row` once it has built its SQL. */
  function answers<T extends ObjectLiteral>(repo: Repository<T>, row: T) {
    const build = repo.findOne.bind(repo);

    repo.findOne = async (options) => (await build(options), row);
  }

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource(GISDAY_COMPETITIONS_ENTITIES);
  });

  beforeEach(() => {
    statements = recordWrites(dataSource).statements;
    submissionRepo = queryCheckingRepository(dataSource, CompetitionSubmission);
    seasonRepo = queryCheckingRepository(dataSource, Season);
    compSeasonRepo = queryCheckingRepository(dataSource, CompetitionSeason);

    service = new MapService(submissionRepo, seasonRepo, compSeasonRepo);
  });

  it("reads a competition season's locations by its guid", async () => {
    await expect(service.getLocationsForSeasonId('cs-2026')).resolves.toEqual([]);

    expect(statements).toEqual([expect.objectContaining({ parameters: ['cs-2026'] })]);
  });

  it("reads one participant's locations in a competition season", async () => {
    await expect(service.getLocationsForUserSeason('cs-2026', 'u-1', 'geojson')).resolves.toEqual({
      type: 'FeatureCollection',
      features: []
    });

    expect(statements).toEqual([expect.objectContaining({ parameters: expect.arrayContaining(['cs-2026', 'u-1']) })]);
  });

  it("reads the active season's locations, found from the loaded active season", async () => {
    answers(seasonRepo, season(2026));
    answers(compSeasonRepo, compSeason(2026));

    await expect(service.getLocationsForActiveSeason('json')).resolves.toEqual([]);
  });

  it("reads one participant's locations in the active season", async () => {
    answers(seasonRepo, season(2026));
    answers(compSeasonRepo, compSeason(2026));

    await expect(service.getUserLocationsForActiveSeason('u-1', 'json')).resolves.toEqual([]);
  });

  it("reads what the previous season already found, from the loaded active and previous seasons", async () => {
    answers(seasonRepo, season(2026));
    answers(compSeasonRepo, compSeason(2026));

    const buildSeasons = compSeasonRepo.find.bind(compSeasonRepo);
    compSeasonRepo.find = async (options) => (await buildSeasons(options), [compSeason(2025)]);

    await expect(service.getAlreadyFoundForActiveSeason()).resolves.toEqual([]);
  });
});

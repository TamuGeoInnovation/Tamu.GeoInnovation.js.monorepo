import { DataSource, Repository } from 'typeorm';

import { Season, SeasonDay } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from './season.service';

// The service's queries as typeorm builds them, with the real entities. season.service.spec.ts mocks the repositories, so
// it cannot see a query typeorm itself refuses, such as a loaded season (whose deadlines are null until an admin sets them)
// passed whole as a where value (#2363).

/** Builds the query as the query-checking repository does, then answers with `value`, as a database holding it would. */
function answering<T extends object>(repo: Repository<T>, method: 'find' | 'findOne', value: unknown) {
  const build = repo[method].bind(repo) as (options?: unknown) => Promise<unknown>;
  (repo as unknown as Record<string, unknown>)[method] = async (options?: unknown) => (await build(options), value);
}

/** Makes the finds of every transaction's manager build their query too, before answering from `recordWrites`' rows. */
function buildingTransactionFinds(dataSource: DataSource) {
  const make = dataSource.createQueryRunner.bind(dataSource);

  dataSource.createQueryRunner = ((...args: Array<unknown>) => {
    const runner = make(...(args as []));
    const answer = runner.manager.find.bind(runner.manager);

    runner.manager.find = (async (entity: never, options?: never) => (
      runner.manager.createQueryBuilder(entity, 'e').setFindOptions(options ?? {}).getQuery(), answer(entity, options)
    )) as typeof runner.manager.find;

    return runner;
  }) as typeof dataSource.createQueryRunner;
}

/** A season as the API loads it: the deadlines nobody has set come back null, and its competitions come with it. */
const loadedSeason = (overrides: Partial<Season> = {}) =>
  Object.assign(new Season(), {
    guid: 's-1',
    year: 2026,
    active: true,
    created: new Date('2026-01-05T15:00:00.123Z'),
    updated: new Date('2026-01-05T15:00:00.123Z'),
    posterSubmissionsCloseAt: null,
    posterFilesCloseAt: null,
    presentationSubmissionsCloseAt: null,
    presentationFilesCloseAt: null,
    paperSubmissionsCloseAt: null,
    paperFilesCloseAt: null,
    cartographySubmissionsCloseAt: null,
    cartographyFilesCloseAt: null,
    competitions: [],
    ...overrides
  });

const loadedDay = () =>
  Object.assign(new SeasonDay(), { guid: 'd-1', date: new Date('2026-11-18T06:00:00.000Z'), events: [] });

describe('SeasonService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: SeasonService;
  let seasonRepo: Repository<Season>;
  let seasonDayRepo: Repository<SeasonDay>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
    buildingTransactionFinds(dataSource);
    // `Season.incrementYear` and a season's own `save()` reach the data source through the entity class.
    Season.useDataSource(dataSource);

    seasonRepo = queryCheckingRepository(dataSource, Season);
    seasonDayRepo = queryCheckingRepository(dataSource, SeasonDay);
    service = new SeasonService(seasonRepo, seasonDayRepo);
  });

  it('lists every season in year order, with its days', async () => {
    await expect(service.findAllOrdered()).resolves.toEqual([]);
  });

  it('finds a season by guid with its days in order', async () => {
    answering(seasonRepo, 'findOne', loadedSeason({ days: [loadedDay()] }));

    await expect(service.findOneWithOrderedDays('s-1')).resolves.toMatchObject({ guid: 's-1' });
  });

  it("finds the active season and its first day's first event", async () => {
    answering(seasonRepo, 'findOne', loadedSeason({ days: [loadedDay()] }));
    answering(seasonDayRepo, 'findOne', loadedDay());

    await expect(service.findOneActive()).resolves.toMatchObject({ guid: 's-1', firstEventTime: null });
  });

  it("finds a year's season and its first day's first event", async () => {
    answering(seasonRepo, 'findOne', loadedSeason({ days: [loadedDay()] }));
    answering(seasonDayRepo, 'findOne', loadedDay());

    await expect(service.findOneByYear(2026)).resolves.toMatchObject({ guid: 's-1' });
  });

  it('finds a season by guid with its days and their events', async () => {
    answering(seasonRepo, 'findOne', loadedSeason({ days: [loadedDay()] }));

    await expect(service.findOneWithDaysAndEvents('s-1')).resolves.toMatchObject({ guid: 's-1' });
  });

  it('creates a season for a year that has none', async () => {
    await expect(service.create({ year: 2027 })).resolves.toMatchObject({ year: 2027 });
  });

  it('finds the latest season', async () => {
    await expect(service.getPreviousSeason()).resolves.toBeUndefined();
  });

  // clonePreviousSeason: `const where = { season: last }` (season.service.ts line 228) hands the whole loaded season to
  // every find that copies its days, broadcasts, classes, tags and the rest. Its deadlines are null until an admin sets
  // them, and typeorm 1 refuses a null inside a where value while building the first of those finds (the season's days):
  // "Null value encountered in property 'e__e_season.posterSubmissionsCloseAt' of a where condition. To match with SQL
  // NULL, the IsNull() operator must be used." Marked failing until the provider is fixed; then it passes, and this fails.
  it.failing('clones the latest season into the next year', async () => {
    // Not active, so the clone does not first save it; the season it saves goes through the entity's own repository.
    answering(seasonRepo, 'find', [loadedSeason({ active: false })]);

    await expect(service.clonePreviousSeason()).resolves.toMatchObject({ year: 2027 });
  });

  it('updates a season, turning off the season that was active', async () => {
    answering(seasonRepo, 'findOne', loadedSeason({ guid: 's-0', year: 2025 }));

    await expect(service.updateSeason('s-1', { active: true, year: 2026 })).resolves.toBeUndefined();
  });

  it("sets when a season's competitions close", async () => {
    answering(seasonRepo, 'findOne', loadedSeason());

    await expect(service.setSubmissionDeadlines('s-1', {})).resolves.toBeDefined();
  });

  it('sets which competitions a season runs', async () => {
    answering(seasonRepo, 'findOne', loadedSeason());

    await expect(service.setCompetitionTypes('s-1', ['poster'])).resolves.toEqual({ competitionTypes: ['poster'] });
  });

  it('deletes a season with its speakers, organizations, sponsors, places, tags and events', async () => {
    answering(
      seasonRepo,
      'findOne',
      loadedSeason({
        speakers: ['sp-1'],
        organizations: ['o-1'],
        sponsors: [],
        places: ['p-1'],
        tags: [],
        events: ['e-1']
      } as unknown as Partial<Season>)
    );

    await expect(service.deleteEntity('s-1')).resolves.toBeDefined();
  });
});

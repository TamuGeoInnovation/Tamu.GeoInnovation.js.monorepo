import { DataSource, Repository } from 'typeorm';

import { Season, SeasonDay } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from './season.service';

// Creating the next season (#3302): `clonePreviousSeason` named the previous season in its where value as the whole loaded
// entity. Its deadlines are null until an admin sets them, and typeorm 1 refuses a null inside a where value while it builds
// the query, so the first find (the season's days) threw and the request answered 500. Built here by typeorm itself, with
// no database (#2363).

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

describe('SeasonService.clonePreviousSeason, built by typeorm (#3302)', () => {
  let dataSource: DataSource;
  let service: SeasonService;
  let seasonRepo: Repository<Season>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
    buildingTransactionFinds(dataSource);
    // `Season.incrementYear` and a season's own `save()` reach the data source through the entity class.
    Season.useDataSource(dataSource);

    seasonRepo = queryCheckingRepository(dataSource, Season);
    service = new SeasonService(seasonRepo, queryCheckingRepository(dataSource, SeasonDay));
  });

  it('clones a previous season whose deadlines are still unset into the next year', async () => {
    // Not active, so the clone does not first save it; the season it saves goes through the entity's own repository.
    answering(seasonRepo, 'find', [loadedSeason({ active: false })]);

    await expect(service.clonePreviousSeason()).resolves.toMatchObject({ year: 2027 });
  });
});

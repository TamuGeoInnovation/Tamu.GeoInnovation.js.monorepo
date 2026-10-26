import {
  DataSource,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  QueryRunner,
  Repository
} from 'typeorm';

import { GISDAY_ENTITIES } from '../entities/all.entity';

/**
 * For specs: the API's real entities on a SQL Server data source that never connects. Its repositories build the real SQL
 * for whatever find options they are given, through typeorm's own query builder, and then return nothing, so a spec can run
 * a provider and see what typeorm makes of its queries without a database.
 *
 * The provider specs mock their repositories, which cannot see a mistake typeorm itself refuses. typeorm 1 throws on a
 * `null` anywhere in a where value while it builds the query, before any database is contacted, so passing a whole loaded
 * entity as a where value (`where: { event: event }`) failed for every event with a `null` column, and every registration
 * answered 500.
 */
export async function queryCheckingDataSource(extraEntities: Array<EntityTarget<ObjectLiteral>> = []): Promise<DataSource> {
  // `extraEntities` adds another library's entities that relate to these, such as the competitions' (#2424).
  const dataSource = new DataSource({
    type: 'mssql',
    host: 'localhost',
    entities: [...GISDAY_ENTITIES, ...extraEntities] as never
  });

  // initialize() would connect. The metadata is all the query builder needs, and building it is what initialize does next.
  await (dataSource as unknown as { buildMetadatas(): Promise<void> }).buildMetadatas();

  return dataSource;
}

/**
 * A repository of `dataSource` whose reads build their SQL and find nothing, and whose saves return what they are given.
 */
export function queryCheckingRepository<T extends ObjectLiteral>(
  dataSource: DataSource,
  entity: EntityTarget<T>
): Repository<T> {
  const repository = dataSource.getRepository(entity);
  const build = (options?: FindManyOptions<T> | FindOneOptions<T>) =>
    repository
      .createQueryBuilder()
      .setFindOptions(options ?? {})
      .getQuery();

  repository.findOne = async (options) => (build(options), null);
  repository.find = async (options) => (build(options), []);
  repository.count = async (options) => (build(options), 0);
  repository.save = (async (entity) => entity) as Repository<T>['save'];

  return repository;
}

/**
 * For specs: makes `dataSource` record the SQL that typeorm writes, instead of sending it anywhere. Every query runner it hands
 * out (transactions included) records each statement and its parameters in `statements` and answers with no rows. Reads that a
 * provider makes inside a transaction come from `rows`, by entity, so a spec can give it the rows a real database would hold.
 *
 * This is what shows how a delete or update matches its rows: the statement itself, built by typeorm from the provider's own
 * criteria. A delete handed whole loaded rows matched on every column, timestamps included, and on SQL Server that matched only
 * some of the time, so a sponsor with a logo could not always be deleted (#2205).
 */
export function recordWrites(
  dataSource: DataSource,
  rows: Array<[EntityTarget<ObjectLiteral>, Array<ObjectLiteral>]> = []
): { statements: Array<{ sql: string; parameters: Array<unknown> }> } {
  const statements: Array<{ sql: string; parameters: Array<unknown> }> = [];

  dataSource.createQueryRunner = () => {
    const runner = {
      connection: dataSource,
      data: {},
      isReleased: false,
      isTransactionActive: false,
      broadcaster: { broadcast: async () => undefined },
      connect: async () => undefined,
      release: async () => undefined,
      startTransaction: async () => ((runner.isTransactionActive = true), undefined),
      commitTransaction: async () => ((runner.isTransactionActive = false), undefined),
      rollbackTransaction: async () => ((runner.isTransactionActive = false), undefined),
      query: async (sql: string, parameters: Array<unknown> = []) => (
        statements.push({ sql, parameters }),
        { raw: [], affected: 0, records: [] }
      )
    } as unknown as QueryRunner & { isTransactionActive: boolean; manager: EntityManager };

    runner.manager = dataSource.createEntityManager(runner);
    runner.manager.find = (async (entity: EntityTarget<ObjectLiteral>) =>
      rows.find(([e]) => e === entity)?.[1] ?? []) as EntityManager['find'];

    return runner;
  };

  return { statements };
}

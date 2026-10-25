import { DataSource, EntityTarget, FindManyOptions, FindOneOptions, ObjectLiteral, Repository } from 'typeorm';

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
export async function queryCheckingDataSource(): Promise<DataSource> {
  const dataSource = new DataSource({ type: 'mssql', host: 'localhost', entities: GISDAY_ENTITIES });

  // initialize() would connect. The metadata is all the query builder needs, and building it is what initialize does next.
  await (dataSource as unknown as { buildMetadatas(): Promise<void> }).buildMetadatas();

  return dataSource;
}

/**
 * A repository of `dataSource` whose reads build their SQL and find nothing, and whose saves return what they are given.
 */
export function queryCheckingRepository<T extends ObjectLiteral>(dataSource: DataSource, entity: EntityTarget<T>): Repository<T> {
  const repository = dataSource.getRepository(entity);
  const build = (options?: FindManyOptions<T> | FindOneOptions<T>) => repository.createQueryBuilder().setFindOptions(options ?? {}).getQuery();

  repository.findOne = async (options) => (build(options), null);
  repository.find = async (options) => (build(options), []);
  repository.count = async (options) => (build(options), 0);
  repository.save = (async (entity) => entity) as Repository<T>['save'];

  return repository;
}

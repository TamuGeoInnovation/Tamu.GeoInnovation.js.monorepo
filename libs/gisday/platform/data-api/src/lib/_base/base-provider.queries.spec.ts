import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Season, Tag } from '../entities/all.entity';
import { BaseProvider } from './base-provider';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from './query-checking-data-source';

/** BaseProvider is abstract; this is the least a provider of it is. Tags, because a tag is small and has a nullable season. */
class TagBaseProvider extends BaseProvider<Tag> {}

// The base provider's queries as typeorm builds them, with a real entity (#2363). Every provider inherits them, and the
// provider specs mock their repositories, so they would pass a query typeorm 1 refuses, such as a loaded entity with a
// null column in a where value.
describe('BaseProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: TagBaseProvider;
  let tagRepo: Repository<Tag>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // A tag as the API loads it: its nullable season comes back null, not undefined.
  const loadedTag = () => Object.assign(new Tag(), { guid: 't-1', name: 'GIS', season: null });

  const findOneReturning = (row: Tag) => {
    const build = tagRepo.findOne;
    tagRepo.findOne = async (options) => (await build(options), row);
  };

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    ({ statements } = recordWrites(dataSource, [[Tag, [loadedTag()]]]));
    tagRepo = queryCheckingRepository(dataSource, Tag);
    provider = new TagBaseProvider(tagRepo);
  });

  it('finds one by guid', async () => {
    await expect(provider.findOne('t-1')).resolves.toBeNull();
  });

  it('finds one by options, a loaded season in the where', async () => {
    const season = Object.assign(new Season(), { guid: 's-1', year: 2026, startDate: null, endDate: null });

    await expect(provider.findOne({ where: { season: { guid: season.guid } }, relations: { season: true } })).resolves.toBeNull();
  });

  it('finds many by guid or by options', async () => {
    await expect(provider.find('t-1')).resolves.toEqual([]);
    await expect(provider.find({ where: { name: 'GIS' }, order: { name: 'ASC' } })).resolves.toEqual([]);
  });

  it('updates a loaded entity whose columns are null', async () => {
    findOneReturning(loadedTag());

    await expect(provider.update('t-1', { name: 'Renamed' })).resolves.toMatchObject({ guid: 't-1', name: 'Renamed' });
  });

  it('creates the entity when the update finds none and is asked to', async () => {
    await expect(provider.update('t-1', { name: 'New' }, true)).resolves.toMatchObject({ name: 'New' });
  });

  it('deletes one loaded entity', async () => {
    findOneReturning(loadedTag());

    await provider.deleteEntity('t-1');

    expect(statements.some((s) => /^\s*DELETE FROM "tags"/i.test(s.sql))).toBe(true);
  });

  it('refuses to delete one that does not exist', async () => {
    await expect(provider.deleteEntity('t-1')).rejects.toThrow(NotFoundException);
  });

  it('deletes many by key', async () => {
    await provider.deleteEntities('t-1, t-2');

    const deletes = statements.filter((s) => /^\s*DELETE FROM "tags"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['t-1', 't-2']]);
  });
});

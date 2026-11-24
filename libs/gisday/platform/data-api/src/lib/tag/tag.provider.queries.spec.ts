import { DataSource, Repository } from 'typeorm';

import { Season, Tag } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { TagProvider } from './tag.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). tag.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
// Its query-builder and entity-manager reads go through recordWrites, which records the SQL and answers no rows.
describe('TagProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: TagProvider;
  let tagRepo: Repository<Tag>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  // Builds the query as typeorm would, then answers with `rows`, as a database holding them would.
  const findReturning = <T>(repo: Repository<T>, rows: Array<T>) => {
    const build = repo.find;
    repo.find = async (options) => (await build(options), rows);
  };

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
  });

  beforeEach(() => {
    tagRepo = queryCheckingRepository(dataSource, Tag);
    provider = new TagProvider(tagRepo, seasonService);
  });

  it('lists the sessions that have a tag, with their days and places', async () => {
    const build = tagRepo.findOne;
    tagRepo.findOne = async (options) => (await build(options), Object.assign(new Tag(), { guid: 't-1', name: 'GIS', season: null }));

    await expect(provider.getSessions('t-1')).resolves.toEqual([]);
  });

  it("lists a season's tags by name", async () => {
    await expect(provider.getTagsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's tags", async () => {
    await expect(provider.getTagsForActiveSeason()).resolves.toEqual([]);
  });

  it('lists every tag by name', async () => {
    await expect(provider.getTags()).resolves.toEqual([]);
  });

  it('copies loaded tags into a loaded season', async () => {
    findReturning(tagRepo, [Object.assign(new Tag(), { guid: 't-1', name: 'GIS', season: null })]);

    const copies = await provider.copyTagsIntoSeason('s-1', ['t-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('creates a tag after looking for one by its name and loaded season', async () => {
    const tag = await provider.createTag({ name: 'GIS', season });

    expect(tag.name).toBe('GIS');
  });
});

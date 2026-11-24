import { DataSource, Repository } from 'typeorm';

import { Season, University } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { UniversityProvider } from './university.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). university.provider.spec.ts mocks the
// repository, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
describe('UniversityProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: UniversityProvider;
  let universityRepo: Repository<University>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
  });

  beforeEach(() => {
    statements.length = 0;
    universityRepo = queryCheckingRepository(dataSource, University);
    provider = new UniversityProvider(universityRepo, seasonService);
  });

  it("lists a season's universities by name", async () => {
    await expect(provider.getEntitiesForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's universities", async () => {
    await expect(provider.getEntitiesForActiveSeason()).resolves.toEqual([]);
  });

  it('copies loaded universities, whose columns are null, into a loaded season', async () => {
    const build = universityRepo.find;
    universityRepo.find = async (options) => (
      await build(options),
      [Object.assign(new University(), { guid: 'u-1', name: 'A university', acronym: null, season: null })]
    );

    const copies = await provider.insertUniversitiesIntoSeason('s-1', ['u-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('deletes universities by key, in a transaction', async () => {
    await provider.deleteEntities('u-1');

    const deletes = statements.filter((s) => /^\s*DELETE FROM "universities"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['u-1']]);
  });
});

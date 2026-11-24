import { DataSource, Repository } from 'typeorm';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { CheckIn, Class, Season } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { ClassProvider } from './class.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). class.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a null in a where value. Its query-builder reads go
// through recordWrites, which records the SQL and answers no rows.
describe('ClassProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: ClassProvider;
  let classRepo: Repository<Class>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
  });

  beforeEach(() => {
    classRepo = queryCheckingRepository(dataSource, Class);
    provider = new ClassProvider(
      classRepo,
      queryCheckingRepository(dataSource, CheckIn),
      null as unknown as ManagementService,
      seasonService
    );
  });

  it("lists a season's classes", async () => {
    await expect(provider.getClassesForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's classes", async () => {
    await expect(provider.getClassesForActiveSeason()).resolves.toEqual([]);
  });

  it('creates a class after looking for the same one, its empty values as null', async () => {
    const created = await provider.createClass({ code: 'GEOG', number: '361', section: null, professorName: null, season: season });

    expect(created.code).toBe('GEOG');
  });

  it('copies loaded classes, whose columns are null, into a loaded season', async () => {
    const build = classRepo.find;
    classRepo.find = async (options) => (
      await build(options),
      [Object.assign(new Class(), { guid: 'c-1', code: 'GEOG', number: null, section: null, professorName: null, season: null })]
    );

    const copies = await provider.copyClassesIntoSeason('s-1', ['c-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it("lists a class's students", async () => {
    await expect(provider.getClassStudents('c-1')).resolves.toEqual([]);
  });

  it("builds a class's attendance roster", async () => {
    await expect(provider.getSimplifiedAttendance('c-1')).resolves.toEqual([]);
  });
});

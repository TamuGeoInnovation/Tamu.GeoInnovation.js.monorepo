import { DataSource, Repository } from 'typeorm';

import { EventLocation, Season } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { EventLocationService } from './event-location.service';

// The service's queries as typeorm builds them, with the real entities (#2363). event-location.service.spec.ts mocks the
// repository, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value. Its
// query-builder reads go through recordWrites, which records the SQL and answers no rows.
describe('EventLocationService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: EventLocationService;
  let locationRepo: Repository<EventLocation>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  // A location as the API loads it.
  const loadedLocation = () =>
    Object.assign(new EventLocation(), { guid: 'l-1', building: 'Eller', room: null, checkInZone: null, place: null, season: null, events: [] });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    ({ statements } = recordWrites(dataSource, [[EventLocation, [loadedLocation()]]]));
    locationRepo = queryCheckingRepository(dataSource, EventLocation);
    service = new EventLocationService(locationRepo, seasonService);
  });

  it("lists a season's locations, ordered by place and building", async () => {
    await expect(service.getEventLocationsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's locations", async () => {
    await expect(service.getEventLocationsForActiveSeason()).resolves.toEqual([]);
  });

  it('lists every location, ordered by place and building', async () => {
    await expect(service.getEntities()).resolves.toEqual([]);
  });

  it('copies loaded locations, whose columns are null, into a loaded season', async () => {
    const build = locationRepo.find;
    locationRepo.find = async (options) => (await build(options), [loadedLocation()]);

    const copies = await service.copyEventLocationsIntoSeason('s-1', ['l-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('deletes locations by key, in a transaction', async () => {
    await service.deleteEntities('l-1');

    const deletes = statements.filter((s) => /^\s*DELETE FROM "event_location"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['l-1']]);
  });
});

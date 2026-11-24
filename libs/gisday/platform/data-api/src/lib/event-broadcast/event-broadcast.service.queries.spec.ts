import { DataSource, Repository } from 'typeorm';

import { EventBroadcast, Season } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { EventBroadcastService } from './event-broadcast.service';

// The service's queries as typeorm builds them, with the real entities (#2363). event-broadcast.service.spec.ts mocks the
// repository, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
describe('EventBroadcastService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: EventBroadcastService;
  let broadcastRepo: Repository<EventBroadcast>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = { findOne: async () => season, findOneActive: async () => season } as unknown as SeasonService;

  // A broadcast as the API loads it: its nullable columns come back null, not undefined.
  const loadedBroadcast = () =>
    Object.assign(new EventBroadcast(), {
      guid: 'b-1',
      name: 'Zoom 1',
      presenterUrl: null,
      password: null,
      place: null,
      season: null,
      events: []
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    broadcastRepo = queryCheckingRepository(dataSource, EventBroadcast);
    service = new EventBroadcastService(broadcastRepo, seasonService);
  });

  it('lists the sessions that use a broadcast, with their days and places', async () => {
    const build = broadcastRepo.findOne;
    broadcastRepo.findOne = async (options) => (await build(options), loadedBroadcast());

    await expect(service.getSessions('b-1')).resolves.toEqual([]);
  });

  it('lists every broadcast with its place', async () => {
    await expect(service.getEntities()).resolves.toEqual([]);
  });

  it("lists a season's broadcasts", async () => {
    await expect(service.getBroadcastsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's broadcasts", async () => {
    await expect(service.getBroadcastsForActiveSeason()).resolves.toEqual([]);
  });

  it('copies loaded broadcasts into a season', async () => {
    const build = broadcastRepo.find;
    broadcastRepo.find = async (options) => (await build(options), [loadedBroadcast()]);

    const copies = await service.copyBroadcastsIntoSeason('s-1', ['b-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('deletes broadcasts by key, in a transaction', async () => {
    ({ statements } = recordWrites(dataSource, [[EventBroadcast, [loadedBroadcast()]]]));

    await service.deleteEntities('b-1');

    const deletes = statements.filter((s) => /^\s*DELETE FROM "event_broadcast"/i.test(s.sql));
    expect(deletes.map((s) => s.parameters)).toEqual([['b-1']]);
  });
});

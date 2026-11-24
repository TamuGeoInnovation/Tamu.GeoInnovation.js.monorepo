import { ConflictException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Asset, EventBroadcast, Place, PlaceLink, Season } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { PlaceService } from './place.service';

// The service's queries as typeorm builds them, with the real entities (#2363). place.service.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
// Its query-builder reads go through recordWrites, which records the SQL and answers no rows. deleteEntities is checked in
// assets/asset-deletes.queries.spec.ts.
describe('PlaceService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: PlaceService;
  let placeRepo: Repository<Place>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  // A place as a find with its links and logos loads it.
  const loadedPlace = () =>
    Object.assign(new Place(), {
      guid: 'p-1',
      name: 'A place',
      website: null,
      visibilitySettings: null,
      season: null,
      links: [Object.assign(new PlaceLink(), { guid: 'pl-1', label: 'Home', url: 'https://example.org' })],
      logos: [Object.assign(new Asset(), { guid: 'a-1', name: 'logo.png', path: 'images/places/logo.png', type: null })]
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
  });

  beforeEach(() => {
    placeRepo = queryCheckingRepository(dataSource, Place);
    service = new PlaceService(
      placeRepo,
      queryCheckingRepository(dataSource, PlaceLink),
      null as unknown as AssetsService,
      seasonService
    );
  });

  it("lists a season's places with their links and logos", async () => {
    await expect(service.getPlacesForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's places", async () => {
    await expect(service.getPlacesForActiveSeason()).resolves.toEqual([]);
  });

  it('reads a place with its links and logos', async () => {
    await expect(service.getEntity('p-1')).resolves.toBeNull();
  });

  it('lists every place with its links and logos', async () => {
    await expect(service.getEntities()).resolves.toEqual([]);
  });

  it('copies loaded places and their links and logos into a loaded season', async () => {
    const build = placeRepo.find;
    placeRepo.find = async (options) => (await build(options), [loadedPlace()]);

    const copies = await service.copyPlacesIntoSeason('s-1', ['p-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('updates a loaded place whose columns are null', async () => {
    const build = placeRepo.findOne;
    placeRepo.findOne = async (options) => (await build(options), loadedPlace());

    const saved = await service.updatePlace('p-1', { name: 'Renamed' });

    expect(saved.name).toBe('Renamed');
  });
});

// A broadcast's place has no cascade, so deleting a place that a broadcast still names was refused by the database, and the
// API answered a bare 500 the admin form could not explain (#3397). It is refused first, with a 409 naming the broadcasts,
// as the class and rubric services refuse what cannot be done.
describe('PlaceService, deleting a place a broadcast still uses (#3397)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  const deleting = (broadcasts: Array<EventBroadcast>) => {
    const place = Object.assign(new Place(), { guid: 'p-1', name: 'A made-up place', logos: [] });
    const { statements } = recordWrites(dataSource, [
      [Place, [place]],
      [EventBroadcast, broadcasts]
    ]);
    const service = new PlaceService(
      dataSource.getRepository(Place),
      dataSource.getRepository(PlaceLink),
      new AssetsService(dataSource.getRepository(Asset)),
      null as unknown as SeasonService
    );

    return { statements, run: () => service.deleteEntities('p-1') };
  };

  it('refuses with a 409 naming the broadcasts, and deletes nothing', async () => {
    const { statements, run } = deleting([
      Object.assign(new EventBroadcast(), { guid: 'b-1', name: 'Made-up stream' }),
      Object.assign(new EventBroadcast(), { guid: 'b-2', name: 'Another made-up stream' })
    ]);

    const refusal = await run().catch((err) => err);

    expect(refusal).toBeInstanceOf(ConflictException);
    expect(refusal.getStatus()).toBe(409);
    expect(refusal.message).toBe(
      'A made-up place is used by 2 broadcasts (Another made-up stream, Made-up stream). Give them another place first.'
    );
    expect(statements.filter((s) => /^\s*DELETE/i.test(s.sql))).toEqual([]);
  });

  it('deletes a place no broadcast uses, as before', async () => {
    const { statements, run } = deleting([]);

    await run();

    expect(statements.filter((s) => /^\s*DELETE FROM "places"/i.test(s.sql)).map((s) => s.parameters)).toEqual([['p-1']]);
  });
});

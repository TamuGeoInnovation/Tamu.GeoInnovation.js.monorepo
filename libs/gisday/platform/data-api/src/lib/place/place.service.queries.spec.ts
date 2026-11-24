import { DataSource, Repository } from 'typeorm';

import { Asset, Place, PlaceLink, Season } from '../entities/all.entity';
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

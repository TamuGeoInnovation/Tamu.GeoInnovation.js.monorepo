import { DataSource, Repository } from 'typeorm';

import { Asset, Season, Sponsor } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { SponsorProvider } from './sponsor.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). sponsor.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded entity with a null column in a where value.
// deleteEntities is checked in assets/asset-deletes.queries.spec.ts.
describe('SponsorProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: SponsorProvider;
  let sponsorRepo: Repository<Sponsor>;

  // A season as the API loads it: its nullable columns come back null, not undefined.
  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });
  const seasonService = {
    findOne: async () => season,
    findOneActive: async () => season
  } as unknown as SeasonService;

  // A sponsor as a find with its logos loads it.
  const loadedSponsor = () =>
    Object.assign(new Sponsor(), {
      guid: 'sp-1',
      name: 'A sponsor',
      website: null,
      contactFirstName: null,
      contactEmail: null,
      season: null,
      logos: [Object.assign(new Asset(), { guid: 'a-1', name: 'logo.png', path: 'images/sponsors/logo.png', type: null })]
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    sponsorRepo = queryCheckingRepository(dataSource, Sponsor);
    provider = new SponsorProvider(sponsorRepo, null as unknown as AssetsService, seasonService);
  });

  it("lists a loaded season's sponsors with their logos, by name", async () => {
    await expect(provider.getSponsorsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's sponsors", async () => {
    await expect(provider.getSponsorsForActiveSeason()).resolves.toEqual([]);
  });

  it('copies loaded sponsors and their logos into a loaded season', async () => {
    const build = sponsorRepo.find;
    sponsorRepo.find = async (options) => (await build(options), [loadedSponsor()]);

    const copies = await provider.copyEntitiesIntoSeason('s-1', ['sp-1']);

    expect(copies[0].season.guid).toBe('s-1');
  });

  it('updates a loaded sponsor whose columns are null', async () => {
    const build = sponsorRepo.findOne;
    sponsorRepo.findOne = async (options) => (await build(options), loadedSponsor());

    const saved = await provider.updateSponsor('sp-1', { name: 'Renamed' });

    expect(saved.name).toBe('Renamed');
  });
});

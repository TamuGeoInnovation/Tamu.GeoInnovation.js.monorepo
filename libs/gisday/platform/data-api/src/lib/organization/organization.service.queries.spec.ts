import { DataSource, Repository } from 'typeorm';

import { Asset, Event, Organization, Speaker } from '../entities/all.entity';
import { answering, buildingTransactionFinds, loadedSeason, queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
import { OrganizationService } from './organization.service';

// The service's queries as typeorm builds them, with the real entities. organization.service.spec.ts mocks the
// repositories, so it cannot see a query typeorm itself refuses, such as a loaded row with a null column passed as a where
// value (#2363).

/** An organization as the API loads it: its contact and text are optional and come back null. */
const loadedOrganization = () =>
  Object.assign(new Organization(), {
    guid: 'o-1',
    name: 'An organization',
    acronym: null,
    website: null,
    text: null,
    contactFirstName: null,
    contactLastName: null,
    contactEmail: null,
    created: new Date('2026-01-05T15:00:00.123Z'),
    updated: new Date('2026-01-05T15:00:00.123Z'),
    logos: []
  });

describe('OrganizationService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: OrganizationService;
  let orgRepo: Repository<Organization>;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    // A copied organization is saved through the entity's own repository.
    Organization.useDataSource(dataSource);

    const seasons = { findOne: async () => loadedSeason(), findOneActive: async () => loadedSeason() } as unknown as SeasonService;

    orgRepo = queryCheckingRepository(dataSource, Organization);
    service = new OrganizationService(orgRepo, queryCheckingRepository(dataSource, Event), seasons, null as unknown as AssetsService);
  });

  it("lists a season's organizations by name", async () => {
    await expect(service.getOrganizationsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's organizations", async () => {
    await expect(service.getOrganizationsForActiveSeason()).resolves.toEqual([]);
  });

  it('lists every organization by name', async () => {
    await expect(service.getOrganizations()).resolves.toEqual([]);
  });

  it('finds an organization with its season and logos', async () => {
    await expect(service.getOrganization('o-1')).resolves.toBeNull();
  });

  it('copies organizations into another season', async () => {
    answering(orgRepo, 'find', [loadedOrganization()]);

    await expect(service.copyOrganizationsIntoSeason('s-1', ['o-1'])).resolves.toHaveLength(1);
  });

  it('updates an organization', async () => {
    answering(orgRepo, 'findOne', loadedOrganization());

    await expect(service.updateOrganization('o-1', { name: 'Renamed' })).resolves.toMatchObject({ name: 'Renamed' });
  });

  it("lists the organizations of the events' speakers", async () => {
    await expect(service.getOrgsWithEvents()).resolves.toEqual([]);
  });

  it('deletes organizations with their logos, leaving their speakers without one', async () => {
    const speaker = Object.assign(new Speaker(), { guid: 'sp-1', firstName: 'Ana', lastName: null, email: null });

    recordWrites(dataSource, [
      [Organization, [loadedOrganization()]],
      [Speaker, [speaker]]
    ]);
    buildingTransactionFinds(dataSource);
    service = new OrganizationService(
      orgRepo,
      queryCheckingRepository(dataSource, Event),
      null as unknown as SeasonService,
      new AssetsService(queryCheckingRepository(dataSource, Asset))
    );

    await expect(service.deleteEntities('o-1')).resolves.toBeDefined();
  });
});

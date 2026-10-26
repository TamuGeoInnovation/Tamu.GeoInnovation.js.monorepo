import { DataSource } from 'typeorm';

import { Asset, Event, Organization, Place, PlaceLink, Sponsor, Speaker, University } from '../entities/all.entity';
import { queryCheckingDataSource, recordWrites } from '../_base/query-checking-data-source';
import { OrganizationService } from '../organization/organization.service';
import { PlaceService } from '../place/place.service';
import { SeasonService } from '../season/season.service';
import { SpeakerProvider } from '../speaker/speaker.provider';
import { SponsorProvider } from '../sponsor/sponsor.provider';
import { AssetsService } from './assets.service';

// The DELETE statements typeorm writes when a sponsor, place, organization or speaker is deleted with its logo or photo, built
// from each provider's own criteria. The provider specs mock their repositories, so they could not see #2205: the asset rows
// were deleted by handing typeorm the whole loaded rows, which it matches on every column. Their timestamps default to
// getdate(), a datetime that ticks every 1/300 s, and as datetimeoffset .xx3 and .xx7 ms are .xx33333 and .xx66667, which a
// JavaScript Date (milliseconds) never equals. So the logo's row was deleted only when it had been created on a whole
// millisecond, about one time in three; otherwise it stayed, and the owner's delete failed on FK_98821d8bf60cd7694ecaa84dc99.
describe('Deleting an owner with its logo or photo, as typeorm writes it (#2205)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  // An asset as a find with `relations` loads it: every column, the timestamps to the millisecond.
  const asset = (guid: string) =>
    Object.assign(new Asset(), {
      guid,
      name: `${guid}.png`,
      path: `images/test/${guid}.png`,
      type: 'logo',
      created: new Date('2026-10-25T20:00:00.123Z'),
      updated: new Date('2026-10-25T20:00:00.123Z')
    });

  const deletes = (statements: Array<{ sql: string; parameters: Array<unknown> }>) =>
    statements.filter((s) => /^\s*DELETE/i.test(s.sql)).map((s) => ({ sql: s.sql.replace(/\s+/g, ' ').trim(), parameters: s.parameters }));

  const cases: Array<[string, () => { owner: unknown; table: string; run: (assets: AssetsService) => Promise<unknown> }]> = [
    [
      'a sponsor and its logo',
      () => ({
        owner: [Sponsor, [Object.assign(new Sponsor(), { guid: 'o-1', name: 'REL CHECK', logos: [asset('a-1')] })]],
        table: 'sponsors',
        run: (assets) => new SponsorProvider(dataSource.getRepository(Sponsor), assets, null as unknown as SeasonService).deleteEntities('o-1')
      })
    ],
    [
      'a place and its logo',
      () => ({
        owner: [Place, [Object.assign(new Place(), { guid: 'o-1', name: 'A place', logos: [asset('a-1')] })]],
        table: 'places',
        run: (assets) =>
          new PlaceService(dataSource.getRepository(Place), dataSource.getRepository(PlaceLink), assets, null as unknown as SeasonService).deleteEntities('o-1')
      })
    ],
    [
      'an organization and its logo',
      () => ({
        owner: [Organization, [Object.assign(new Organization(), { guid: 'o-1', name: 'An organization', logos: [asset('a-1')] })]],
        table: 'organizations',
        run: (assets) =>
          new OrganizationService(dataSource.getRepository(Organization), dataSource.getRepository(Event), null as unknown as SeasonService, assets).deleteEntities('o-1')
      })
    ],
    [
      'a speaker and their photo',
      () => ({
        owner: [Speaker, [Object.assign(new Speaker(), { guid: 'o-1', firstName: 'A', images: [asset('a-1')] })]],
        table: 'speakers',
        run: (assets) =>
          new SpeakerProvider(
            dataSource.getRepository(Speaker),
            dataSource.getRepository(University),
            dataSource.getRepository(Organization),
            dataSource.getRepository(Event),
            assets,
            null as unknown as SeasonService
          ).deleteEntities('o-1')
      })
    ]
  ];

  it.each(cases)('deletes %s by key, not by matching every column', async (_, setUp) => {
    const { owner, table, run } = setUp();
    const { statements } = recordWrites(dataSource, [owner as [typeof Sponsor, Array<Sponsor>]]);

    await run(new AssetsService(dataSource.getRepository(Asset)));

    const [assetDelete, ownerDelete] = deletes(statements);
    expect(assetDelete.sql).toMatch(/^DELETE FROM "assets" WHERE/);
    expect(assetDelete.sql).not.toMatch(/"created"|"updated"|"name"|"path"/);
    expect(assetDelete.parameters).toEqual(['a-1']);
    expect(ownerDelete.sql).toMatch(new RegExp(`^DELETE FROM "${table}" WHERE`));
    expect(ownerDelete.parameters).toEqual(['o-1']);
  });
});

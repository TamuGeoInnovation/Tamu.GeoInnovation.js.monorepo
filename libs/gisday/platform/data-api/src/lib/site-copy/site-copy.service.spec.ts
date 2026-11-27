import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { Event, EventBroadcast, Organization, Season, Speaker, Tag } from '../entities/all.entity';
import { SITE_COPY_KINDS, SiteCopyFile, SiteCopyRecords } from './site-copy.format';
import { SiteCopyService } from './site-copy.service';

/**
 * The rules of copying a season between GIS Day sites (#2078): what never leaves a site, what an import
 * refuses, and that a dry run writes nothing. The full export and import were run end to end against two
 * local databases when this was written; this covers the rules on every pull request.
 *
 * Each entity's own columns come from a list here, as TypeORM's metadata would give them, so the rules are
 * tested against the columns that hold people's details, not against whatever the mock happens to hold.
 */
const COLUMNS = new Map<unknown, Array<string>>([
  [Season, ['guid', 'year', 'active', 'created', 'updated']],
  [Tag, ['guid', 'name', 'created', 'updated']],
  [Event, ['guid', 'name', 'created', 'updated']],
  [Speaker, ['guid', 'firstName', 'lastName', 'email', 'accountGuid', 'affiliation', 'description', 'created', 'updated']],
  [Organization, ['guid', 'name', 'website', 'contactFirstName', 'contactLastName', 'contactEmail', 'created', 'updated']],
  [
    EventBroadcast,
    ['guid', 'name', 'publicUrl', 'meetingId', 'phoneNumber', 'presenterUrl', 'password', 'created', 'updated']
  ]
]);

function dataSource(rows: Map<unknown, Array<Record<string, unknown>>>) {
  const save = vi.fn();
  const manager = {
    find: vi.fn(async (entity: unknown) => rows.get(entity) ?? []),
    findOne: vi.fn(async (entity: unknown) => (rows.get(entity) ?? [])[0] ?? null),
    count: vi.fn(async () => 1),
    save,
    connection: {
      getMetadata: (entity: unknown) => ({
        ownColumns: (COLUMNS.get(entity) ?? ['guid']).map((propertyName) => ({ propertyName, type: String }))
      })
    }
  };

  return {
    save,
    manager,
    source: { manager, transaction: vi.fn(async (work) => work(manager)) } as unknown as DataSource
  };
}

const file = (records: Partial<SiteCopyRecords>): SiteCopyFile => ({
  format: 'gisday-site-copy',
  version: 1,
  source: 'https://txgisday.org',
  exportedAt: '2026-10-22T13:00:00.000Z',
  year: 2026,
  records: { ...(Object.fromEntries(SITE_COPY_KINDS.map((k) => [k, []])) as SiteCopyRecords), ...records }
});

describe('SiteCopyService', () => {
  describe('.export()', () => {
    it("never carries people's contact details, accounts, or a broadcast's host link and password", async () => {
      const { source } = dataSource(
        new Map<unknown, Array<Record<string, unknown>>>([
          [Season, [{ guid: 's', year: 2026, active: true }]],
          // An event is what brings its speakers, their organizations and its broadcast into the file.
          [Event, [{ guid: 'e', name: 'Keynote', speakers: [{ guid: 'p' }], broadcast: { guid: 'b' } }]],
          [
            Speaker,
            [
              {
                guid: 'p',
                firstName: 'Ana',
                lastName: 'Diaz',
                email: 'ana@example.edu',
                accountGuid: 'auth0|1',
                organization: { guid: 'o' }
              }
            ]
          ],
          [
            Organization,
            [{ guid: 'o', name: 'Geography', contactFirstName: 'Bo', contactLastName: 'Li', contactEmail: 'bo@example.edu' }]
          ],
          [
            EventBroadcast,
            [{ guid: 'b', name: 'Live', publicUrl: 'https://zoom/j', presenterUrl: 'https://zoom/s', password: 'x1' }]
          ]
        ])
      );

      const result = await new SiteCopyService(source).export('s', 'https://txgisday.org');
      const exported = JSON.stringify(result);

      // The records themselves do come along, so the test is about what is left out of them.
      expect(result.records.speakers.map((s) => s.firstName)).toEqual(['Ana']);
      expect(result.records.organizations.map((o) => o.name)).toEqual(['Geography']);
      expect(result.records.eventBroadcasts.map((b) => b.publicUrl)).toEqual(['https://zoom/j']);

      for (const secret of ['ana@example.edu', 'auth0|1', 'bo@example.edu', '"Bo"', 'https://zoom/s', '"x1"']) {
        expect(exported).not.toContain(secret);
      }
    });
  });

  describe('.import()', () => {
    it('refuses a file that is not a site copy, or that does not say where it came from', async () => {
      const service = new SiteCopyService(dataSource(new Map()).source);

      await expect(service.import({ nope: true } as unknown as SiteCopyFile, false)).rejects.toThrow(BadRequestException);
      await expect(service.import({ ...file({}), source: 'file:///etc' }, false)).rejects.toThrow(BadRequestException);
    });

    // An import fetches the file's logos and photos from its `source`, so a source that could be any address would let
    // whoever uploads a file make this server request any host, an internal one included (CodeQL js/request-forgery, #3776).
    it('refuses a file from a site that is not a GIS Day site, so the server never fetches from an address a file names', async () => {
      const service = new SiteCopyService(dataSource(new Map()).source);

      for (const source of [
        'https://internal.example',
        'https://10.0.0.5',
        'https://txgisday.org.example.com',
        'https://txgisday.org:8443',
        // This server's own ports: a local site is allowed only when ORIGINS lists it.
        'http://localhost:6379'
      ]) {
        await expect(service.import({ ...file({}), source }, false)).rejects.toThrow(BadRequestException);
      }
    });

    it("accepts every GIS Day site's addresses, this API's own origins and a local site", async () => {
      vi.stubEnv('ORIGINS', 'https://gisday.example.edu,http://localhost:4200');

      try {
        const service = new SiteCopyService(dataSource(new Map([[Season, []]])).source);

        for (const source of [
          'https://txgisday.org',
          'https://gisday.tamu.edu',
          'https://tamu.txgisday.org',
          'https://gisday.ucgis.org',
          'https://gisday.example.edu',
          'http://localhost:4200'
        ]) {
          await expect(service.import({ ...file({}), source }, false)).resolves.toMatchObject({ applied: false });
        }
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('writes nothing in a dry run, and says what it would add', async () => {
      const { source, save } = dataSource(new Map([[Season, []]]));
      const plan = await new SiteCopyService(source).import(
        file({ tags: [{ guid: 't', name: 'Lunch', season: null }] }),
        false
      );

      expect(save).not.toHaveBeenCalled();
      expect(plan.applied).toBe(false);
      expect(plan.kinds.find((k) => k.kind === 'tags')?.added).toEqual(['Lunch']);
    });

    it('refuses to apply when this site already has a season for the same year that is not the one in the file', async () => {
      const { source, save } = dataSource(new Map([[Season, [{ guid: 'made-by-hand', year: 2026 }]]]));
      const plan = await new SiteCopyService(source).import(
        file({ seasons: [{ guid: 'from-file', year: 2026, active: true }] }),
        true
      );

      expect(plan.applied).toBe(false);
      expect(plan.blockers).toHaveLength(1);
      expect(save).not.toHaveBeenCalled();
    });

    it("does not write people's contact details even when a file carries them", async () => {
      const { source, save } = dataSource(new Map([[Season, []]]));

      await new SiteCopyService(source).import(
        file({ speakers: [{ guid: 'p', firstName: 'Ana', email: 'ana@example.edu', accountGuid: 'auth0|1' }] }),
        true
      );

      const written = save.mock.calls.find(([entity]) => entity === Speaker)?.[1];

      expect(written).toEqual(expect.objectContaining({ guid: 'p', firstName: 'Ana' }));
      expect(written).not.toHaveProperty('email');
      expect(written).not.toHaveProperty('accountGuid');
    });
  });
});

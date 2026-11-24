import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';

import { Event, EventLocation, Season, Speaker } from '../entities/all.entity';
import { loadedSeason, queryCheckingDataSource, recordWrites } from '../_base/query-checking-data-source';
import { SiteCopyFile } from './site-copy.format';
import { SiteCopyService } from './site-copy.service';

// The service's queries as typeorm builds them, with the real entities. site-copy.service.spec.ts mocks the data source,
// so it cannot see a query typeorm itself refuses (#2363). This service reads through the data source's own manager, whose
// queries run on a query runner: `recordWrites` takes them, so each is built by typeorm and finds nothing, unless a test
// answers a find with rows below.

/** Makes the manager's finds answer with `rows` for an entity, after typeorm has built and run their query. */
function answering(dataSource: DataSource, rows: Array<[EntityTarget<ObjectLiteral>, Array<ObjectLiteral>]>) {
  const manager = dataSource.manager;
  const find = manager.find.bind(manager);
  const findOne = manager.findOne.bind(manager);

  manager.find = (async (entity: EntityTarget<ObjectLiteral>, options?: never) => (
    await find(entity, options), rows.find(([e]) => e === entity)?.[1] ?? []
  )) as typeof manager.find;
  manager.findOne = (async (entity: EntityTarget<ObjectLiteral>, options: never) => (
    await findOne(entity, options), rows.find(([e]) => e === entity)?.[1][0] ?? null
  )) as typeof manager.findOne;
}

describe('SiteCopyService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: SiteCopyService;

  beforeEach(async () => {
    dataSource = await queryCheckingDataSource();
    recordWrites(dataSource);
    service = new SiteCopyService(dataSource);
  });

  it('exports a season with what its events bring', async () => {
    // An event with a speaker, a venue and a broadcast, so every lookup by guid the export makes is built.
    const event = Object.assign(new Event(), {
      guid: 'e-1',
      name: 'A session',
      capacity: null,
      speakers: [{ guid: 'sp-1' }],
      tags: [],
      location: { guid: 'l-1' },
      broadcast: { guid: 'b-1' },
      day: null,
      season: { guid: 's-1' }
    });
    const speaker = Object.assign(new Speaker(), {
      guid: 'sp-1',
      firstName: 'Ana',
      lastName: null,
      organization: { guid: 'o-1' },
      university: { guid: 'u-1' },
      season: { guid: 's-1' }
    });
    const location = Object.assign(new EventLocation(), { guid: 'l-1', building: null, room: null, place: { guid: 'p-1' } });

    answering(dataSource, [
      [Season, [loadedSeason()]],
      [Event, [event]],
      [Speaker, [speaker]],
      [EventLocation, [location]]
    ]);

    await expect(service.export('s-1', 'https://gisday.tamu.edu')).resolves.toMatchObject({ year: 2026 });
  });

  it('plans an import without writing it, checking each link it carries', async () => {
    const file: SiteCopyFile = {
      format: 'gisday-site-copy',
      version: 1,
      source: 'https://gisday.tamu.edu',
      exportedAt: '2026-11-01T00:00:00.000Z',
      year: 2026,
      records: {
        seasons: [{ guid: 's-1', year: 2026, active: true, posterSubmissionsCloseAt: null }],
        seasonDays: [{ guid: 'd-1', date: '2026-11-18T06:00:00.000Z', season: { guid: 's-1' } }],
        events: [
          {
            guid: 'e-1',
            name: 'A session',
            capacity: null,
            day: { guid: 'd-1' },
            season: { guid: 's-1' },
            location: { guid: 'l-elsewhere' },
            broadcast: null,
            speakers: [{ guid: 'sp-elsewhere' }],
            tags: []
          }
        ]
      }
    } as unknown as SiteCopyFile;

    await expect(service.import(file, false)).resolves.toMatchObject({ applied: false, blockers: [] });
  });
});

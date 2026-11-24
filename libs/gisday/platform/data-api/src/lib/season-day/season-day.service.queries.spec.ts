import { DataSource, Repository } from 'typeorm';

import { Event, EventLocation, SeasonDay, Speaker } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { SeasonDayService } from './season-day.service';

// The service's query as typeorm builds it, with the real entities (#2363). season-day.service.spec.ts mocks the
// repository, so it would pass a query typeorm 1 refuses.
describe('SeasonDayService queries, built by typeorm', () => {
  let dataSource: DataSource;
  let service: SeasonDayService;
  let dayRepo: Repository<SeasonDay>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    dayRepo = queryCheckingRepository(dataSource, SeasonDay);
    service = new SeasonDayService(dayRepo);
  });

  it("lists a day's sessions with their tags, speakers' organizations and places, whose columns are null", async () => {
    // A day as the API loads it with its sessions: their nullable columns and relations come back null.
    const day = Object.assign(new SeasonDay(), {
      guid: 'd-1',
      date: new Date('2026-11-18T06:00:00Z'),
      events: [
        Object.assign(new Event(), {
          guid: 'e-1',
          name: 'A session',
          active: true,
          startTime: '10:00',
          capacity: null,
          tags: [],
          speakers: [Object.assign(new Speaker(), { guid: 'sp-1', firstName: 'A', lastName: null, organization: null })],
          location: Object.assign(new EventLocation(), { guid: 'l-1', building: null, room: null, place: null })
        })
      ]
    });
    const build = dayRepo.findOne;
    dayRepo.findOne = async (options) => (await build(options), day);

    const events = await service.getDayEvents('d-1');

    expect(events.map((e) => e.presenters)).toEqual([['A']]);
  });
});

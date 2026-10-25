import { DataSource } from 'typeorm';

import { Event, EventBroadcast, EventLocation, Season, Speaker, Sponsor, Tag, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { EventProvider } from './event.provider';

// The provider's queries as typeorm builds them, with the real entities. event.provider.spec.ts mocks the repositories,
// so it passed while counting an event's RSVPs failed on typeorm 1 for every event.
describe('EventProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: EventProvider;
  let eventRepo: ReturnType<typeof queryCheckingRepository<Event>>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    const repo = <T>(entity: new () => T) => queryCheckingRepository(dataSource, entity);

    eventRepo = repo(Event);
    provider = new EventProvider(
      eventRepo,
      repo(EventLocation),
      repo(EventBroadcast),
      repo(Speaker),
      repo(Tag),
      repo(Sponsor),
      repo(UserRsvp),
      repo(Season),
      null as unknown as SeasonService
    );
  });

  it("counts the RSVPs of an event whose capacity, like every event on the site today, is null", async () => {
    const event = Object.assign(new Event(), { guid: 'e-1', name: 'A session', capacity: null, requiresRsvp: null });
    eventRepo.findOne = async () => event;

    await expect(provider.getNumberOfRsvps('e-1')).resolves.toBe(0);
  });
});

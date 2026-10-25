import { DataSource } from 'typeorm';

import { Event, RsvpType, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository } from '../_base/query-checking-data-source';
import { UserRsvpProvider } from './user-rsvp.provider';

// The provider's queries as typeorm builds them, with the real entities. user-rsvp.provider.spec.ts mocks the
// repositories, so it passed while every registration on typeorm 1 answered 500.
describe('UserRsvpProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: UserRsvpProvider;
  let eventRepo: ReturnType<typeof queryCheckingRepository<Event>>;

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    eventRepo = queryCheckingRepository(dataSource, Event);
    provider = new UserRsvpProvider(
      queryCheckingRepository(dataSource, UserRsvp),
      eventRepo,
      queryCheckingRepository(dataSource, RsvpType)
    );
  });

  it('registers for an event whose capacity, like every event on the site today, is null', async () => {
    // An event as the API loads it: its nullable columns come back null, not undefined.
    const event = Object.assign(new Event(), { guid: 'e-1', name: 'A session', capacity: null, requiresRsvp: null });
    eventRepo.findOne = async () => event;

    const rsvp = await provider.insertUserRsvp('e-1', null, 'auth0|someone');

    expect(rsvp.event.guid).toBe('e-1');
    expect(rsvp.accountGuid).toBe('auth0|someone');
  });
});

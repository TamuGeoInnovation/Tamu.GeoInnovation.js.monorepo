import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { Event, RsvpType, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { UserRsvpProvider } from './user-rsvp.provider';

// The rest of the provider's queries as typeorm builds them, with the real entities (#2363); user-rsvp.provider.queries.spec.ts
// has registering. Removing an RSVP goes through recordWrites, which records the SQL typeorm writes.
describe('UserRsvpProvider queries, built by typeorm (the rest)', () => {
  let dataSource: DataSource;
  let provider: UserRsvpProvider;
  let rsvpRepo: Repository<UserRsvp>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // An RSVP as the API loads it, with its eager event, whose nullable columns come back null.
  const loadedRsvp = () =>
    Object.assign(new UserRsvp(), {
      guid: 'r-1',
      accountGuid: 'auth0|someone',
      event: Object.assign(new Event(), { guid: 'e-1', name: 'A session', capacity: null, requiresRsvp: null })
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
  });

  beforeEach(() => {
    ({ statements } = recordWrites(dataSource, [[UserRsvp, [loadedRsvp()]]]));
    rsvpRepo = queryCheckingRepository(dataSource, UserRsvp);
    provider = new UserRsvpProvider(rsvpRepo, queryCheckingRepository(dataSource, Event), queryCheckingRepository(dataSource, RsvpType));
  });

  it("looks up a user's RSVP for an event", async () => {
    await expect(provider.getUserRsvpForEvent('auth0|someone', 'e-1')).rejects.toThrow(NotFoundException);
  });

  it("lists a user's RSVPs with their events", async () => {
    await expect(provider.getUserRsvps('auth0|someone')).resolves.toEqual([]);
  });

  it("removes a user's loaded RSVP", async () => {
    const build = rsvpRepo.findOne;
    rsvpRepo.findOne = async (options) => (await build(options), loadedRsvp());

    await provider.deleteRsvpForUser('e-1', 'auth0|someone');

    expect(statements.some((s) => /^\s*DELETE FROM "user_rsvps"/i.test(s.sql))).toBe(true);
  });
});

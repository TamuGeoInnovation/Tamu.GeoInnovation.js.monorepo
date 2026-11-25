import { NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

import { CheckIn, Event, EventLocation } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { CheckInProvider } from './check-in.provider';

// The provider's queries as typeorm builds them, with the real entities (#2363). check-in.provider.spec.ts mocks the
// repositories, so it would pass a query typeorm 1 refuses, such as a loaded event with a null column in a where value.
describe('CheckInProvider queries, built by typeorm', () => {
  let dataSource: DataSource;
  let provider: CheckInProvider;
  let eventRepo: Repository<Event>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  // Builds the query as typeorm would, then answers with `row`, as a database holding it would.
  const returning = <T>(repo: Repository<T>, row: T) => {
    const build = repo.findOne;
    repo.findOne = async (options) => (await build(options), row);
  };

  // An event as the API loads it: its nullable columns come back null, not undefined.
  const loadedEvent = () =>
    Object.assign(new Event(), {
      guid: 'e-1',
      name: 'A session',
      capacity: null,
      requiresRsvp: null,
      mode: null,
      checkInCode: null,
      checkInAnyTime: true,
      startTime: null,
      endTime: null,
      day: null,
      location: Object.assign(new EventLocation(), { guid: 'l-1', building: null, room: null, checkInZone: null })
    });

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
  });

  beforeEach(() => {
    statements.length = 0;
    eventRepo = queryCheckingRepository(dataSource, Event);
    provider = new CheckInProvider(queryCheckingRepository(dataSource, CheckIn), eventRepo);
  });

  it("lists a user's check-ins with their events", async () => {
    await expect(provider.getCheckinsForUser('auth0|someone')).resolves.toEqual([]);
  });

  it("lists a session's check-ins, newest first", async () => {
    await expect(provider.getCheckinsForEvent('e-1')).resolves.toEqual([]);
  });

  it("looks up a user's check-in for a session", async () => {
    await expect(provider.getUserCheckinForEvent('e-1', 'auth0|someone')).rejects.toThrow(NotFoundException);
  });

  it('checks in the signed-in attendee to a session whose columns are null', async () => {
    returning(eventRepo, loadedEvent());

    const checkin = await provider.insertUserCheckin('e-1', 'auth0|someone');

    expect(checkin.event.guid).toBe('e-1');
    expect(checkin.accountGuid).toBe('auth0|someone');
  });

  it('checks in an attendee an organizer names', async () => {
    returning(eventRepo, loadedEvent());

    const checkin = await provider.insertAttendeeCheckin('e-1', 'auth0|someone');

    expect(checkin.event.guid).toBe('e-1');
  });

  it("makes a session's check-in code, writing it only where none is set", async () => {
    returning(eventRepo, loadedEvent());

    await expect(provider.getCheckInCode('e-1')).resolves.toEqual({ code: null });
    expect(statements.some((s) => /^\s*UPDATE "events"/i.test(s.sql))).toBe(true);
  });
});

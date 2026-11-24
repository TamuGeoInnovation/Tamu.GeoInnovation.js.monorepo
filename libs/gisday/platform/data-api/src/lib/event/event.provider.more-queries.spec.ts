import { NotFoundException } from '@nestjs/common';
import { DataSource, DeepPartial, Repository } from 'typeorm';

import { Event, EventBroadcast, EventLocation, Season, Speaker, Sponsor, Tag, UserRsvp } from '../entities/all.entity';
import { queryCheckingDataSource, queryCheckingRepository, recordWrites } from '../_base/query-checking-data-source';
import { SeasonService } from '../season/season.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventProvider } from './event.provider';

// The rest of the provider's queries as typeorm builds them, with the real entities (#2363); event.provider.queries.spec.ts
// has counting RSVPs. Its query-builder reads and its update go through recordWrites, which records the SQL and answers no
// rows. getEntitiesByDay reads every event with no options.
describe('EventProvider queries, built by typeorm (the rest)', () => {
  let dataSource: DataSource;
  let provider: EventProvider;
  let eventRepo: Repository<Event>;
  let statements: Array<{ sql: string; parameters: Array<unknown> }>;

  const season = Object.assign(new Season(), { guid: 's-1', year: 2026, active: true, startDate: null, endDate: null });

  // An event as the API loads it: its nullable columns come back null, not undefined.
  const loadedEvent = () =>
    Object.assign(new Event(), {
      guid: 'e-1',
      name: 'A session',
      capacity: null,
      requiresRsvp: null,
      judgedCompetition: null,
      observedAttendeeStart: null,
      observedAttendeeEnd: null,
      location: null,
      broadcast: null,
      judges: []
    });

  const findOneReturning = (row: Event) => {
    const build = eventRepo.findOne;
    eventRepo.findOne = async (options) => (await build(options), row);
  };

  beforeAll(async () => {
    dataSource = await queryCheckingDataSource();
    ({ statements } = recordWrites(dataSource));
  });

  beforeEach(() => {
    statements.length = 0;
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
      { findOneActive: async () => season } as unknown as SeasonService
    );
  });

  it("lists a season's events with their days, places and tags", async () => {
    await expect(provider.getEventsForSeason('s-1')).resolves.toEqual([]);
  });

  it("lists the active season's events", async () => {
    await expect(provider.getEventsForActiveSeason()).resolves.toEqual([]);
  });

  it('lists every event with its relations, by start time', async () => {
    await expect(provider.getEvents()).resolves.toEqual([]);
  });

  it('inserts an event with no speakers and no tags', async () => {
    const saved = await provider.insertEvent({ name: 'A session', speakers: [], tags: [] } as unknown as DeepPartial<Event>);

    expect(saved.name).toBe('A session');
  });

  it('updates a loaded event whose columns are null', async () => {
    findOneReturning(loadedEvent());

    const saved = await provider.updateEvent('e-1', { name: 'Renamed', speakers: [], tags: [] } as unknown as UpdateEventDto);

    expect(saved.name).toBe('Renamed');
  });

  it("reads a session's judging", async () => {
    findOneReturning(loadedEvent());

    await expect(provider.getJudging('e-1')).resolves.toEqual({ judgedCompetition: null, judgingClosed: false, judges: [] });
  });

  it("reads an event's details with its relations", async () => {
    findOneReturning(loadedEvent());

    await expect(provider.getEventDetails('e-1')).resolves.toMatchObject({ guid: 'e-1' });
  });

  it("reads an event's attendance counts", async () => {
    findOneReturning(loadedEvent());

    await expect(provider.getEventAttendance('e-1')).resolves.toMatchObject({ guid: 'e-1' });
  });

  it('puts events on the public schedule, changing only active', async () => {
    await expect(provider.setActive(['e-1', 'e-2'], true)).resolves.toEqual({ updated: 0 });
    expect(statements.some((s) => /^\s*UPDATE "events"/i.test(s.sql))).toBe(true);
  });

  it("updates a loaded event's attendance counts", async () => {
    findOneReturning(loadedEvent());

    const saved = await provider.updateAttendance('e-1', { observedAttendeeStart: 12 } as never);

    expect(saved.observedAttendeeStart).toBe(12);
  });

  it('looks up the season, with its days in order, to copy events into', async () => {
    await expect(provider.copyEventsIntoSeason('s-1', ['e-1'])).rejects.toThrow(NotFoundException);
  });
});

import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import {
  Event,
  EventBroadcast,
  EventLocation,
  Season,
  Speaker,
  Sponsor,
  Tag,
  UserRsvp
} from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { EventProvider } from './event.provider';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventProvider', () => {
  let provider: EventProvider;
  let eventRepo: Repository<Event>;
  let tagRepo: Repository<Tag>;
  let speakerRepo: Repository<Speaker>;
  let rsvpRepo: Repository<UserRsvp>;
  let seasonRepo: Repository<Season>;
  let seasonService: SeasonService;

  const queryBuilder = (result: unknown, method: 'getMany' | 'getOne' = 'getMany') => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['leftJoinAndSelect', 'where', 'orderBy', 'addOrderBy']) {
      qb[m] = jest.fn(() => qb);
    }
    qb.getMany = jest.fn().mockResolvedValue(method === 'getMany' ? result : []);
    qb.getOne = jest.fn().mockResolvedValue(method === 'getOne' ? result : null);
    return qb;
  };

  const repoMock = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn()
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventProvider,
        { provide: getRepositoryToken(Event), useValue: repoMock() },
        { provide: getRepositoryToken(EventLocation), useValue: repoMock() },
        { provide: getRepositoryToken(EventBroadcast), useValue: repoMock() },
        { provide: getRepositoryToken(Speaker), useValue: repoMock() },
        { provide: getRepositoryToken(Tag), useValue: repoMock() },
        { provide: getRepositoryToken(Sponsor), useValue: repoMock() },
        { provide: getRepositoryToken(UserRsvp), useValue: repoMock() },
        { provide: getRepositoryToken(Season), useValue: repoMock() },
        { provide: SeasonService, useValue: { findOneActive: jest.fn() } }
      ]
    }).compile();

    provider = module.get<EventProvider>(EventProvider);
    eventRepo = module.get(getRepositoryToken(Event));
    tagRepo = module.get(getRepositoryToken(Tag));
    speakerRepo = module.get(getRepositoryToken(Speaker));
    rsvpRepo = module.get(getRepositoryToken(UserRsvp));
    seasonRepo = module.get(getRepositoryToken(Season));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getEventsForSeason()', () => {
    it('scopes to the season and orders by day then start time', async () => {
      const qb = queryBuilder([{ guid: 'e-1' }]);
      jest.spyOn(eventRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(provider.getEventsForSeason('season-1')).resolves.toEqual([{ guid: 'e-1' }]);
      expect(qb.where).toHaveBeenCalledWith('event.season = :guid', { guid: 'season-1' });
      expect(qb.orderBy).toHaveBeenCalledWith('eventDay.date', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('event.startTime', 'ASC');
    });

    it('throws NotFound rather than querying when no season guid is supplied', async () => {
      const cqb = jest.spyOn(eventRepo, 'createQueryBuilder');

      await expect(provider.getEventsForSeason(undefined)).rejects.toThrow(NotFoundException);
      expect(cqb).not.toHaveBeenCalled();
    });
  });

  describe('.getEventDetails()', () => {
    const withRelations = () =>
      ({
        guid: 'e-1',
        name: 'Intro to GIS',
        broadcast: { guid: 'b-1', presenterUrl: 'https://zoom.example/host' },
        resources: 'Bring a laptop',
        requirements: 'Install QGIS beforehand'
      }) as unknown as Event;

    /**
     * This is access control, not formatting. `broadcast` carries the presenter join URL, and
     * resources and requirements are for registered attendees. An anonymous caller must not
     * receive any of them, so it is asserted rather than left to inspection.
     */
    it('withholds broadcast, resources and requirements from an anonymous caller', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(withRelations());

      const event = await provider.getEventDetails('e-1');

      expect(event.broadcast).toBeNull();
      expect(event.resources).toBeNull();
      expect(event.requirements).toBeNull();
      expect(event.name).toBe('Intro to GIS');
    });

    it('includes them for a signed-in caller', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(withRelations());

      const event = await provider.getEventDetails('e-1', true);

      expect(event.broadcast).toEqual(expect.objectContaining({ guid: 'b-1' }));
      expect(event.resources).toBe('Bring a laptop');
      expect(event.requirements).toBe('Install QGIS beforehand');
    });

    it('throws NotFound when the event does not exist', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getEventDetails('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('.updateEvent()', () => {
    const existing = { guid: 'e-1', name: 'Old title' } as unknown as Event;

    it('relates the supplied tag and speaker guids to the event', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(existing);
      jest.spyOn(tagRepo, 'create').mockImplementation((t) => t as never);
      jest.spyOn(speakerRepo, 'create').mockImplementation((s) => s as never);
      const save = jest.fn().mockResolvedValue({ guid: 'e-1' });
      jest.spyOn(eventRepo, 'create').mockReturnValue({ save } as never);

      await provider.updateEvent('e-1', {
        name: 'New title',
        tags: ['t-1', 't-2'],
        speakers: ['s-1']
      } as unknown as UpdateEventDto);

      const passed = (eventRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.tags).toEqual([{ guid: 't-1' }, { guid: 't-2' }]);
      expect(passed.speakers).toEqual([{ guid: 's-1' }]);
      expect(passed.name).toBe('New title');
    });

    it('throws NotFound when the event does not exist', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);

      await expect(
        provider.updateEvent('missing', { tags: [], speakers: [] } as unknown as UpdateEventDto)
      ).rejects.toThrow(NotFoundException);
    });

    /**
     * Regression coverage.
     *
     * `UpdateEventDto` declares `tags` and `speakers` as required, but it is an **interface** --
     * the global `ValidationPipe` has no decorator metadata to work from, so nothing enforces that
     * at runtime. A request omitting either threw a TypeError on `.map()`, which the catch reported
     * as 422 "Could not insert new Event" -- wrong status reason and wrong verb, on an update.
     */
    it('treats omitted tags and speakers as empty rather than crashing', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(existing);
      const save = jest.fn().mockResolvedValue({ guid: 'e-1' });
      jest.spyOn(eventRepo, 'create').mockReturnValue({ save } as never);

      await expect(
        provider.updateEvent('e-1', { name: 'New title' } as unknown as UpdateEventDto)
      ).resolves.toEqual({ guid: 'e-1' });

      const passed = (eventRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.tags).toEqual([]);
      expect(passed.speakers).toEqual([]);
    });

    it('clears tags when an empty list is supplied', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ ...existing } as Event);
      jest.spyOn(eventRepo, 'create').mockReturnValue({ save: jest.fn() } as never);

      await provider.updateEvent('e-1', { tags: [], speakers: [] } as unknown as UpdateEventDto);

      // An empty list is a deliberate "remove them all", distinct from omitting the field.
      expect((eventRepo.create as jest.Mock).mock.calls[0][0].tags).toEqual([]);
    });
  });

  describe('.getNumberOfRsvps()', () => {
    it('counts the RSVPs for the event', async () => {
      const event = { guid: 'e-1' } as Event;
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);
      jest.spyOn(rsvpRepo, 'count').mockResolvedValue(7);

      await expect(provider.getNumberOfRsvps('e-1')).resolves.toBe(7);
      expect(rsvpRepo.count).toHaveBeenCalledWith({ where: { event } });
    });

    /**
     * Current behaviour, recorded rather than endorsed: a guid matching no event answers 0 rather
     * than 404, so "no such event" and "nobody has RSVPed" are indistinguishable to the caller.
     */
    it('answers 0 for an event that does not exist', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);
      const count = jest.spyOn(rsvpRepo, 'count');

      await expect(provider.getNumberOfRsvps('missing')).resolves.toBe(0);
      expect(count).not.toHaveBeenCalled();
    });
  });

  describe('.updateAttendance()', () => {
    it('applies only the counts that were supplied', async () => {
      const save = jest.fn().mockResolvedValue(true);
      const event = { guid: 'e-1', observedAttendeeStart: 10, observedAttendeeEnd: 8, save } as never;
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);

      await provider.updateAttendance('e-1', { observedAttendeeStart: 25 } as never);

      // Omitting a count must leave the recorded one alone rather than zeroing it.
      expect((event as unknown as Event).observedAttendeeStart).toBe(25);
      expect((event as unknown as Event).observedAttendeeEnd).toBe(8);
      expect(save).toHaveBeenCalled();
    });

    it('accepts a zero count rather than treating it as absent', async () => {
      const save = jest.fn().mockResolvedValue(true);
      const event = { guid: 'e-1', observedAttendeeStart: 10, save } as never;
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);

      await provider.updateAttendance('e-1', { observedAttendeeStart: 0 } as never);

      // Nobody turning up is a real observation, and `!== undefined` is what preserves it.
      expect((event as unknown as Event).observedAttendeeStart).toBe(0);
    });

    it('throws NotFound when the event does not exist', async () => {
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateAttendance('missing', {} as never)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('.copyEventsIntoSeason()', () => {
    const seasonWithDays = () =>
      ({ guid: 'season-2', days: [{ guid: 'd-1' }, { guid: 'd-2' }] }) as unknown as Season;

    it('throws NotFound when the target season does not exist', async () => {
      jest.spyOn(seasonRepo, 'createQueryBuilder').mockReturnValue(queryBuilder(null, 'getOne') as never);

      await expect(provider.copyEventsIntoSeason('missing', ['e-1'])).rejects.toThrow(
        NotFoundException
      );
    });

    it('refuses a season with no days to put the events on', async () => {
      jest
        .spyOn(seasonRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder({ guid: 'season-2', days: [] }, 'getOne') as never);

      await expect(provider.copyEventsIntoSeason('season-2', ['e-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    /**
     * Regression coverage.
     *
     * The guard here was `if (!events)`. `find` resolves to an array, never null, so it never
     * fired: copying guids that match nothing answered 200 with an empty list rather than saying
     * there was nothing to copy. Sibling providers check `.length === 0`, which is the intent.
     */
    it('reports that there was nothing to copy rather than succeeding silently', async () => {
      jest
        .spyOn(seasonRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder(seasonWithDays(), 'getOne') as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([]);
      const create = jest.spyOn(eventRepo, 'create');

      await expect(provider.copyEventsIntoSeason('season-2', ['missing'])).rejects.toThrow(
        NotFoundException
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('strips identity and every relation off the copy', async () => {
      const source = {
        guid: 'e-1',
        created: new Date(),
        updated: new Date(),
        name: 'Intro to GIS',
        speakers: [{ guid: 's-1' }],
        broadcast: { guid: 'b-1' },
        location: { guid: 'el-1' },
        courseCredit: { guid: 'cc-1' },
        sponsors: [{ guid: 'sp-1' }]
      } as unknown as Event;

      jest
        .spyOn(seasonRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder(seasonWithDays(), 'getOne') as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(eventRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await provider.copyEventsIntoSeason('season-2', ['e-1']);

      const passed = (eventRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.speakers).toBeUndefined();
      expect(passed.broadcast).toBeUndefined();
      expect(passed.location).toBeUndefined();
      expect(passed.courseCredit).toBeUndefined();
      expect(passed.sponsors).toBeUndefined();
      expect(passed.name).toBe('Intro to GIS');
    });

    /**
     * Current behaviour, recorded rather than endorsed: every copied event is placed on the target
     * season's **first** day, whatever day it sat on before. Copying a three-day programme
     * collapses it onto day one and the schedule has to be rebuilt by hand.
     *
     * Whether that is intended -- copy then reschedule -- or a gap is a product question.
     */
    it('places every copied event on the first day of the target season', async () => {
      jest
        .spyOn(seasonRepo, 'createQueryBuilder')
        .mockReturnValue(queryBuilder(seasonWithDays(), 'getOne') as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', day: { guid: 'old-day-1' } },
        { guid: 'e-2', day: { guid: 'old-day-3' } }
      ] as unknown as Event[]);
      jest
        .spyOn(eventRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await provider.copyEventsIntoSeason('season-2', ['e-1', 'e-2']);

      const days = (eventRepo.create as jest.Mock).mock.calls.map((c) => c[0].day.guid);
      expect(days).toEqual(['d-1', 'd-1']);
    });
  });

  describe('.getEventsForActiveSeason()', () => {
    it('reads events for whichever season is active', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      const qb = queryBuilder([{ guid: 'e-1' }]);
      jest.spyOn(eventRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(provider.getEventsForActiveSeason()).resolves.toEqual([{ guid: 'e-1' }]);
      expect(qb.where).toHaveBeenCalledWith('event.season = :guid', { guid: 'active' });
    });

    it('surfaces NotFound when no season is active', async () => {
      // The lookup sits outside the try, so this propagates untouched.
      jest.spyOn(seasonService, 'findOneActive').mockRejectedValue(new NotFoundException());

      await expect(provider.getEventsForActiveSeason()).rejects.toThrow(NotFoundException);
    });
  });
});

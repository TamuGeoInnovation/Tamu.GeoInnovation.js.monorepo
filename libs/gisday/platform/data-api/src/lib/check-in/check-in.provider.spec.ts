import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { checkInZoneMessage } from '@tamu-gisc/gisday/common';

import { CheckIn, Event } from '../entities/all.entity';
import { CheckInProvider } from './check-in.provider';

/**
 * A session whose check-in is open now: all of today in Central time (#1795). Times without an offset
 * are Central time.
 */
const openNow = { day: { date: new Date() }, startTime: '00:00:00', endTime: '23:59:59' };

describe('CheckInProvider', () => {
  let provider: CheckInProvider;
  let checkInRepo: Repository<CheckIn>;
  let eventRepo: Repository<Event>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInProvider,
        {
          provide: getRepositoryToken(CheckIn),
          useValue: { find: jest.fn(), findOne: jest.fn(), create: jest.fn() }
        },
        { provide: getRepositoryToken(Event), useValue: { findOne: jest.fn() } }
      ]
    }).compile();

    provider = module.get<CheckInProvider>(CheckInProvider);
    checkInRepo = module.get(getRepositoryToken(CheckIn));
    eventRepo = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getCheckinsForUser()', () => {
    it('scopes to the account and loads the event', async () => {
      jest.spyOn(checkInRepo, 'find').mockResolvedValue([{ guid: 'c-1' } as CheckIn]);

      await expect(provider.getCheckinsForUser('acct-1')).resolves.toEqual([{ guid: 'c-1' }]);
      expect(checkInRepo.find).toHaveBeenCalledWith({
        where: { accountGuid: 'acct-1' },
        relations: ['event']
      });
    });

    /**
     * The account guid comes from the JWT rather than the request body, so an empty one means the
     * token was not what the guard expected. Rejecting rather than querying matters: an empty
     * `where` on this table would return every check-in for every attendee.
     */
    it('rejects a missing account guid instead of querying', async () => {
      const find = jest.spyOn(checkInRepo, 'find');

      await expect(provider.getCheckinsForUser(undefined)).rejects.toThrow(
        UnprocessableEntityException
      );
      await expect(provider.getCheckinsForUser('')).rejects.toThrow(UnprocessableEntityException);
      expect(find).not.toHaveBeenCalled();
    });
  });

  describe('.insertUserCheckin()', () => {
    it('creates the check-in against the resolved event', async () => {
      const event = { guid: 'e-1', ...openNow } as unknown as Event;
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);
      const save = jest.fn().mockResolvedValue({ guid: 'c-new' });
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save } as never);

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
      expect(checkInRepo.create).toHaveBeenCalledWith({ event, accountGuid: 'acct-1' });
    });

    it('refuses a second check-in for the same attendee and event', async () => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue({ guid: 'c-existing' } as CheckIn);
      const create = jest.spyOn(checkInRepo, 'create');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(create).not.toHaveBeenCalled();
    });

    it('looks for the duplicate scoped to both the event and the attendee', async () => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ guid: 'e-1', ...openNow } as unknown as Event);
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save: jest.fn() } as never);

      await provider.insertUserCheckin('e-1', 'acct-1');

      // Scoping to only one of the two would either reject every attendee after the first, or
      // reject an attendee's second event.
      expect(checkInRepo.findOne).toHaveBeenCalledWith({
        where: { event: { guid: 'e-1' }, accountGuid: 'acct-1' }
      });
    });

    it('refuses to check in to an event that does not exist', async () => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(null);
      const create = jest.spyOn(checkInRepo, 'create');

      await expect(provider.insertUserCheckin('missing', 'acct-1')).rejects.toThrow(
        UnprocessableEntityException
      );
      expect(create).not.toHaveBeenCalled();
    });
  });

  /**
   * #1766: an in-person event at a location with a check-in zone accepts a check-in only from
   * inside it. A position counts as inside when its accuracy circle touches the zone, with the
   * accuracy capped at `CHECK_IN_MAX_ACCURACY` metres. There is no checking in anyway: organizers
   * add exceptions from the admin page. Hybrid and virtual events, and locations with no zone, need
   * no location.
   */
  describe('.insertUserCheckin() and the check-in zone', () => {
    // CHECK_IN_MAX_ACCURACY in @tamu-gisc/gisday/common.
    const cap = 100;
    const metre = 1 / 111195;
    // The Memorial Student Center, traced around the building.
    const msc = [
      { latitude: 30.61134149709473, longitude: -96.34182507980555 },
      { latitude: 30.612176343177023, longitude: -96.34258857834743 },
      { latitude: 30.613240646827258, longitude: -96.340954566882 },
      { latitude: 30.612430828541257, longitude: -96.34027516032576 }
    ];
    const venue = 'TAMU Memorial Student Center';
    const middleOfMsc = {
      latitude: msc.reduce((sum, c) => sum + c.latitude, 0) / msc.length,
      longitude: msc.reduce((sum, c) => sum + c.longitude, 0) / msc.length
    };
    // The zone's southernmost corner is nearest to anything due south of it.
    const southOfMsc = (metres: number, accuracy?: number) => ({
      latitude: msc[0].latitude - metres * metre,
      longitude: msc[0].longitude,
      accuracy
    });
    const kyleField = { latitude: 30.6101, longitude: -96.3403, accuracy: 10 };

    let save: jest.Mock;

    const withEvent = (mode: string, checkInZone: Array<{ latitude: number; longitude: number }> = msc) => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(eventRepo, 'findOne')
        .mockResolvedValue({ guid: 'e-1', mode, ...openNow, location: { building: venue, checkInZone } } as unknown as Event);
      save = jest.fn().mockResolvedValue({ guid: 'c-new' });
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save } as never);
    };

    it('loads the location of the event, which holds the zone', async () => {
      withEvent('in-person');

      await provider.insertUserCheckin('e-1', 'acct-1', middleOfMsc);

      expect(eventRepo.findOne).toHaveBeenCalledWith({ where: { guid: 'e-1' }, relations: ['location', 'day'] });
    });

    it('checks in an attendee inside the zone, and saves nothing about where they were', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', middleOfMsc)).resolves.toEqual({ guid: 'c-new' });
      expect(checkInRepo.create).toHaveBeenCalledWith({ event: expect.anything(), accountGuid: 'acct-1' });
    });

    it('checks in an attendee outside the walls whose accuracy circle reaches the zone', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(60, 70))).resolves.toEqual({ guid: 'c-new' });
    });

    it('refuses an attendee outside the zone whose accuracy circle does not reach it, and names where to be', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(60, 40))).rejects.toMatchObject({
        status: 403,
        message: checkInZoneMessage(venue)
      });
      expect(save).not.toHaveBeenCalled();
    });

    it('treats a position with no accuracy as exact', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(5))).rejects.toThrow(ForbiddenException);
    });

    it(`counts no more than ${cap} m of accuracy, so a vague position cannot reach the zone`, async () => {
      withEvent('in-person');

      await expect(
        provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(cap + 20, 5000))
      ).rejects.toThrow(ForbiddenException);
      await expect(
        provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(cap - 20, 5000))
      ).resolves.toEqual({ guid: 'c-new' });
    });

    it('ignores a nonsense accuracy', async () => {
      withEvent('in-person');
      const notANumber = { ...southOfMsc(20), accuracy: '50' as never };

      await expect(provider.insertUserCheckin('e-1', 'acct-1', notANumber)).rejects.toThrow(ForbiddenException);
      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(20, -50))).rejects.toThrow(
        ForbiddenException
      );
    });

    it('refuses an attendee at Kyle Field', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', kyleField)).rejects.toThrow(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });

    it('offers no way to check in anyway from outside the zone', async () => {
      withEvent('in-person');

      // What the page used to send to check in anyway: an extra flag after the location.
      const insert = provider.insertUserCheckin as (...args: Array<unknown>) => Promise<unknown>;

      await expect(insert.call(provider, 'e-1', 'acct-1', kyleField, true)).rejects.toThrow(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses a check-in with no usable location, and says why', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toMatchObject({
        status: 403,
        message: 'Checking in to this event needs your location.'
      });
      await expect(
        provider.insertUserCheckin('e-1', 'acct-1', { latitude: undefined, longitude: undefined })
      ).rejects.toThrow(ForbiddenException);
      await expect(
        provider.insertUserCheckin('e-1', 'acct-1', { latitude: '30.612' as never, longitude: -96.3414 })
      ).rejects.toThrow(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });

    it('needs no location for a hybrid or virtual event, even at a location with a zone', async () => {
      withEvent('hybrid');
      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });

      withEvent('virtual');
      await expect(provider.insertUserCheckin('e-1', 'acct-1', kyleField)).resolves.toEqual({ guid: 'c-new' });
    });

    it('needs no location for an in-person event at a location with no zone', async () => {
      withEvent('in-person', null);
      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });

      // Fewer than three corners is not a zone.
      withEvent('in-person', msc.slice(0, 2));
      await expect(provider.insertUserCheckin('e-1', 'acct-1', kyleField)).resolves.toEqual({ guid: 'c-new' });
    });
    /**
     * #1767: the admin page's Check-ins > Add is how organizers add the exceptions the zone
     * refuses, so it is never held to the zone.
     */
    it('checks in an attendee an organizer names to an in-person event with a zone, with no position', async () => {
      withEvent('in-person');

      await expect(provider.insertAttendeeCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
      expect(checkInRepo.create).toHaveBeenCalledWith({ event: expect.anything(), accountGuid: 'acct-1' });
    });

    it('still refuses an organizer a second check-in for the same attendee and event', async () => {
      withEvent('in-person');
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue({ guid: 'c-existing' } as CheckIn);

      await expect(provider.insertAttendeeCheckin('e-1', 'acct-1')).rejects.toThrow(UnprocessableEntityException);
      expect(save).not.toHaveBeenCalled();
    });
  });

  /**
   * #1795: an attendee checks in only from a session's start until 15 minutes after its end, the
   * window the session page shows the button in. Organizers adding a check-in are exempt.
   */
  describe('.insertUserCheckin() and when check-in is open', () => {
    // Wednesday 18 November 2026, 4:00 to 5:00 PM Central, stored as the admin form stores them. The
    // day as the API reads it from the database: midnight Central, in UTC.
    const session = {
      guid: 'e-1',
      mode: 'hybrid',
      day: { date: new Date('2026-11-18T06:00:00Z') },
      startTime: '16:00:00 GMT-0600 (Central Standard Time)',
      endTime: '17:00:00 GMT-0600 (Central Standard Time)'
    };

    let save: jest.Mock;

    const withSession = (overrides: Record<string, unknown> = {}) => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ ...session, ...overrides } as unknown as Event);
      save = jest.fn().mockResolvedValue({ guid: 'c-new' });
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save } as never);
    };

    const at = (iso: string) => jest.useFakeTimers({ now: new Date(iso), doNotFake: ['nextTick', 'setImmediate'] });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('refuses an attendee a minute early, and says when it opens', async () => {
      withSession();
      at('2026-11-18T21:59:00Z'); // 3:59 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(
        new ForbiddenException('Check-in for this session opens when it starts, at 4:00 PM.')
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses an attendee the day before', async () => {
      withSession();
      at('2026-11-17T22:30:00Z');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(ForbiddenException);
    });

    it('checks in an attendee from the moment the session starts', async () => {
      withSession();
      at('2026-11-18T22:00:00Z'); // 4:00 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
    });

    it('checks in an attendee up to 15 minutes after the session ends', async () => {
      withSession();
      at('2026-11-18T23:15:00Z'); // 5:15 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
    });

    it('refuses an attendee after that, and says check-in has closed', async () => {
      withSession();
      at('2026-11-18T23:16:00Z');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(
        new ForbiddenException('Check-in for this session has closed.')
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses an attendee to a session whose time is not set or cannot be read, as the page shows no button', async () => {
      at('2026-11-18T22:30:00Z');

      withSession({ day: null });
      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(/its time is not set/);

      withSession({ startTime: 'Invalid Date' });
      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(/its time is not set/);
    });

    it('tells an early attendee when, before asking where they are', async () => {
      at('2026-11-18T21:00:00Z');
      withSession({
        mode: 'in-person',
        location: {
          building: 'TAMU Rudder Plaza',
          checkInZone: [
            { latitude: 30.613149134544702, longitude: -96.34032883332456 },
            { latitude: 30.61341806004229, longitude: -96.34058900760697 },
            { latitude: 30.613209152317065, longitude: -96.34093233037139 }
          ]
        }
      });

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(/opens when it starts/);
    });

    it('lets an organizer add a check-in at any time', async () => {
      withSession();
      at('2026-11-17T12:00:00Z');

      await expect(provider.insertAttendeeCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
    });
  });

  describe('.getUserCheckinForEvent()', () => {
    it('returns the check-in for that attendee and event', async () => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue({ guid: 'c-1' } as CheckIn);

      await expect(provider.getUserCheckinForEvent('e-1', 'acct-1')).resolves.toEqual({
        guid: 'c-1'
      });
      expect(checkInRepo.findOne).toHaveBeenCalledWith({
        where: { event: { guid: 'e-1' }, accountGuid: 'acct-1' }
      });
    });

    it('throws NotFound when the attendee has not checked in', async () => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.getUserCheckinForEvent('e-1', 'acct-1')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});

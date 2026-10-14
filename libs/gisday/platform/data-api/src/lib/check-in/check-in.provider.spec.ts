import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { checkInZoneMessage } from '@tamu-gisc/gisday/common';

import { CheckIn, Event } from '../entities/all.entity';
import { CheckInProvider } from './check-in.provider';

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
      const event = { guid: 'e-1' } as Event;
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
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({ guid: 'e-1' } as Event);
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
   * inside it, with a 30 metre margin. Hybrid and virtual events, and locations with no zone, need
   * no location.
   */
  describe('.insertUserCheckin() and the check-in zone', () => {
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
    const southOfMsc = (metres: number) => ({
      latitude: msc[0].latitude - metres * metre,
      longitude: msc[0].longitude
    });
    const kyleField = { latitude: 30.6101, longitude: -96.3403 };

    let save: jest.Mock;

    const withEvent = (mode: string, checkInZone: Array<{ latitude: number; longitude: number }> = msc) => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(eventRepo, 'findOne')
        .mockResolvedValue({ guid: 'e-1', mode, location: { building: venue, checkInZone } } as Event);
      save = jest.fn().mockResolvedValue({ guid: 'c-new' });
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save } as never);
    };

    it('loads the location of the event, which holds the zone', async () => {
      withEvent('in-person');

      await provider.insertUserCheckin('e-1', 'acct-1', middleOfMsc);

      expect(eventRepo.findOne).toHaveBeenCalledWith({ where: { guid: 'e-1' }, relations: ['location', 'day'] });
    });

    it('checks in an attendee inside the zone', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', middleOfMsc)).resolves.toEqual({ guid: 'c-new' });
    });

    it('checks in an attendee just outside the walls, within the margin for GPS error', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(20))).resolves.toEqual({ guid: 'c-new' });
    });

    it('refuses an attendee beyond the margin, and names where to be', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', southOfMsc(60))).rejects.toThrow(
        new ForbiddenException(checkInZoneMessage(venue))
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses an attendee at Kyle Field', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1', kyleField)).rejects.toThrow(ForbiddenException);
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses a check-in with no usable location', async () => {
      withEvent('in-person');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(ForbiddenException);
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
  });

  /**
   * #1766: check-in opens when an event starts and closes 15 minutes after it ends, in the API as on
   * the page, so nobody checks in early by calling the API directly.
   */
  describe('.insertUserCheckin() and when check-in is open', () => {
    // 18 November 2026, 4:00 to 5:00 PM Central, stored as GIS Day stores them.
    const event = {
      guid: 'e-1',
      mode: 'hybrid',
      startTime: '16:00:00 GMT-0600 (Central Standard Time)',
      endTime: '17:00:00 GMT-0600 (Central Standard Time)',
      day: { date: new Date('2026-11-18T06:00:00Z') }
    } as unknown as Event;

    let save: jest.Mock;

    beforeEach(() => {
      jest.spyOn(checkInRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue(event);
      save = jest.fn().mockResolvedValue({ guid: 'c-new' });
      jest.spyOn(checkInRepo, 'create').mockReturnValue({ save } as never);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const at = (iso: string) => jest.useFakeTimers({ now: new Date(iso), doNotFake: ['nextTick', 'setImmediate'] });

    it('refuses a check-in before the event starts, and says when it opens', async () => {
      at('2026-11-18T21:59:00Z'); // 3:59 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(
        new ForbiddenException('Check-in for this event opens when it starts, at 4:00 PM.')
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses a check-in the day before', async () => {
      at('2026-11-17T22:30:00Z');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(ForbiddenException);
    });

    it('accepts a check-in from the moment the event starts', async () => {
      at('2026-11-18T22:00:00Z'); // 4:00 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
    });

    it('accepts a check-in up to 15 minutes after the event ends', async () => {
      at('2026-11-18T23:15:00Z'); // 5:15 PM Central

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).resolves.toEqual({ guid: 'c-new' });
    });

    it('refuses a check-in after that', async () => {
      at('2026-11-18T23:16:00Z');

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(
        new ForbiddenException('Check-in for this event has closed.')
      );
      expect(save).not.toHaveBeenCalled();
    });

    it('checks the time before the location, so an early attendee is told when, not where', async () => {
      at('2026-11-18T21:00:00Z');
      jest.spyOn(eventRepo, 'findOne').mockResolvedValue({
        ...event,
        mode: 'in-person',
        location: {
          building: 'TAMU Rudder Plaza',
          checkInZone: [
            { latitude: 30.613149134544702, longitude: -96.34032883332456 },
            { latitude: 30.61341806004229, longitude: -96.34058900760697 },
            { latitude: 30.613209152317065, longitude: -96.34093233037139 }
          ]
        }
      } as unknown as Event);

      await expect(provider.insertUserCheckin('e-1', 'acct-1')).rejects.toThrow(/opens when it starts/);
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

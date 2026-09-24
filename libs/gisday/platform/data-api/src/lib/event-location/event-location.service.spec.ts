import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { EventLocation } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { EventLocationService } from './event-location.service';

describe('EventLocationService', () => {
  let service: EventLocationService;
  let locationRepo: Repository<EventLocation>;
  let seasonService: SeasonService;

  const queryBuilder = (result: unknown) => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['leftJoinAndSelect', 'where', 'orderBy', 'addOrderBy']) {
      qb[m] = jest.fn(() => qb);
    }
    qb.getMany = jest.fn().mockResolvedValue(result);
    return qb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventLocationService,
        {
          provide: getRepositoryToken(EventLocation),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    service = module.get<EventLocationService>(EventLocationService);
    locationRepo = module.get(getRepositoryToken(EventLocation));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getEventLocationsForSeason()', () => {
    it('scopes to the season and applies the default ordering', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-1' } as never);
      const qb = queryBuilder([{ guid: 'el-1' }]);
      jest.spyOn(locationRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEventLocationsForSeason('season-1')).resolves.toEqual([{ guid: 'el-1' }]);
      expect(qb.where).toHaveBeenCalledWith('season.guid = :guid', { guid: 'season-1' });
      expect(qb.orderBy).toHaveBeenCalledWith('organization.name', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('event-location.building', 'ASC');
    });

    /**
     * Regression coverage.
     *
     * This method is not `async` and did not await the season lookup, so `season` held a pending
     * Promise. A Promise is always truthy, so `if (!season)` never fired and the guard below it was
     * dead: asking for the locations of a season that does not exist ran the query anyway and
     * answered an empty list instead of 422.
     *
     * The two other season lookups in this file do await, which is what makes this an oversight
     * rather than a decision.
     */
    it('rejects a season that does not exist rather than returning an empty list', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);
      const qb = queryBuilder([]);
      jest.spyOn(locationRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEventLocationsForSeason('missing')).rejects.toThrow(
        UnprocessableEntityException
      );
      // The query must not run at all for a season that is not there.
      expect(qb.getMany).not.toHaveBeenCalled();
    });
  });

  describe('.getEventLocationsForActiveSeason()', () => {
    it('resolves the active season and reads locations against it', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'active' } as never);
      const qb = queryBuilder([{ guid: 'el-1' }]);
      jest.spyOn(locationRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEventLocationsForActiveSeason()).resolves.toEqual([{ guid: 'el-1' }]);
      expect(qb.where).toHaveBeenCalledWith('season.guid = :guid', { guid: 'active' });
    });

    it('surfaces NotFound when no season is active', async () => {
      // `findOneActive` throws rather than resolving falsy, so the 422 guard below it is
      // unreachable and callers see a 404. Asserting the status they actually get.
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getEventLocationsForActiveSeason()).rejects.toThrow(NotFoundException);
    });
  });

  describe('.getEntities()', () => {
    it('lists locations with their place, ordered', async () => {
      const qb = queryBuilder([{ guid: 'el-1' }]);
      jest.spyOn(locationRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEntities()).resolves.toEqual([{ guid: 'el-1' }]);
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith('event-location.place', 'organization');
      expect(qb.orderBy).toHaveBeenCalledWith('organization.name', 'ASC');
    });
  });

  describe('.copyEventLocationsIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(service.copyEventLocationsIntoSeason('missing', ['el-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when there is nothing to copy', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(locationRepo, 'find').mockResolvedValue([]);

      await expect(service.copyEventLocationsIntoSeason('season-2', ['el-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity and every relation off the copy before saving it', async () => {
      const source = {
        guid: 'el-1',
        created: new Date(),
        updated: new Date(),
        building: 'ILSB',
        room: '101',
        season: { guid: 'season-1' },
        place: { guid: 'p-1' },
        events: [{ guid: 'e-1' }]
      } as unknown as EventLocation;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(locationRepo, 'find').mockResolvedValue([source]);
      jest.spyOn(locationRepo, 'create').mockImplementation((e) => e as never);
      jest.spyOn(locationRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await service.copyEventLocationsIntoSeason('season-2', ['el-1']);

      const passed = (locationRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.place).toBeUndefined();
      expect(passed.events).toBeUndefined();
      expect(passed.created).toBeUndefined();
      // `season` is deleted and then re-set to the target, so the copy lands in the new season
      // rather than carrying the old one.
      expect(passed.season).toEqual({ guid: 'season-2' });
      expect(passed.building).toBe('ILSB');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, jest.Mock>) => {
      (locationRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await service.deleteEntities('el-1,el-2');
      expect(manager.delete).toHaveBeenLastCalledWith(EventLocation, ['el-1', 'el-2']);

      await service.deleteEntities(['el-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(EventLocation, ['el-3']);
    });

    it('detaches the location from its events before deleting it', async () => {
      const event = { guid: 'e-1', location: { guid: 'el-1' } };
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 'el-1', events: [event] }]),
        save: jest.fn().mockResolvedValue([event]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await service.deleteEntities(['el-1']);

      // Without this the delete fails on the foreign key, or orphans the event.
      expect(event.location).toBeNull();
      expect(manager.save).toHaveBeenCalledWith([event]);
    });
  });
});

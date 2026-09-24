import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { EventBroadcast } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { EventBroadcastService } from './event-broadcast.service';

describe('EventBroadcastService', () => {
  let service: EventBroadcastService;
  let broadcastRepo: Repository<EventBroadcast>;
  let seasonService: SeasonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventBroadcastService,
        {
          provide: getRepositoryToken(EventBroadcast),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        { provide: SeasonService, useValue: { findOneActive: jest.fn() } }
      ]
    }).compile();

    service = module.get<EventBroadcastService>(EventBroadcastService);
    broadcastRepo = module.get(getRepositoryToken(EventBroadcast));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getEntities()', () => {
    it('lists broadcasts ordered by name', async () => {
      jest.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getEntities()).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });
  });

  describe('.getBroadcastsForSeason()', () => {
    it('scopes to the season and orders by name', async () => {
      jest.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getBroadcastsForSeason('season-1')).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        order: { name: 'ASC' }
      });
    });
  });

  describe('.getBroadcastsForActiveSeason()', () => {
    it('reads broadcasts for whichever season is active', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      jest.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getBroadcastsForActiveSeason()).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'active' } },
        order: { name: 'ASC' }
      });
    });

    it('surfaces NotFound when no season is active', async () => {
      // The season lookup sits outside the try, so this one propagates untouched. It also reads
      // `season.guid` without a null check, which is safe only because `findOneActive` throws
      // rather than resolving null.
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getBroadcastsForActiveSeason()).rejects.toThrow(NotFoundException);
    });
  });

  describe('.copyBroadcastsIntoSeason()', () => {
    it('strips identity and the old season, then attaches the target season', async () => {
      const source = {
        guid: 'b-1',
        created: new Date(),
        updated: new Date(),
        name: 'Zoom',
        presenterUrl: 'https://example.com/host',
        season: { guid: 'season-1' }
      } as unknown as EventBroadcast;

      jest.spyOn(broadcastRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(broadcastRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await service.copyBroadcastsIntoSeason('season-2', ['b-1']);

      const passed = (broadcastRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.created).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      expect(passed.name).toBe('Zoom');
    });

    it('copies every requested broadcast', async () => {
      jest.spyOn(broadcastRepo, 'find').mockResolvedValue([
        { guid: 'b-1', name: 'Zoom' },
        { guid: 'b-2', name: 'Teams' }
      ] as EventBroadcast[]);
      jest
        .spyOn(broadcastRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      const copied = await service.copyBroadcastsIntoSeason('season-2', ['b-1', 'b-2']);

      expect(copied).toHaveLength(2);
      expect(broadcastRepo.create).toHaveBeenCalledTimes(2);
    });

    /**
     * Documents current behaviour rather than endorsing it.
     *
     * A failed lookup is wrapped as 422 by the outer catch, not 500 -- so a database outage is
     * reported to the client as "you sent something unprocessable". The nested inner try around
     * `return Promise.all(...)` is separately unreachable: nothing inside it is awaited, so a
     * rejection escapes after the block has already exited.
     */
    it('reports a lookup failure as 422 rather than 500', async () => {
      jest.spyOn(broadcastRepo, 'find').mockRejectedValue(new Error('connection lost'));

      await expect(service.copyBroadcastsIntoSeason('season-2', ['b-1'])).rejects.not.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, jest.Mock>) => {
      (broadcastRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        save: jest.fn(),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await service.deleteEntities('b-1,b-2');
      expect(manager.delete).toHaveBeenLastCalledWith(EventBroadcast, ['b-1', 'b-2']);

      await service.deleteEntities(['b-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(EventBroadcast, ['b-3']);
    });

    it('detaches the broadcast from its events before deleting it', async () => {
      const event = { guid: 'e-1', broadcast: { guid: 'b-1' } };
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 'b-1', events: [event] }]),
        save: jest.fn().mockResolvedValue([event]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await service.deleteEntities(['b-1']);

      expect(event.broadcast).toBeNull();
      expect(manager.save).toHaveBeenCalledWith([event]);
    });

    it('flattens events across several broadcasts', async () => {
      const first = { guid: 'e-1', broadcast: {} };
      const second = { guid: 'e-2', broadcast: {} };
      const manager = {
        find: jest.fn().mockResolvedValue([
          { guid: 'b-1', events: [first] },
          { guid: 'b-2', events: [second] }
        ]),
        save: jest.fn().mockResolvedValue([first, second]),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await service.deleteEntities(['b-1', 'b-2']);

      expect(manager.save).toHaveBeenCalledWith([first, second]);
      expect(first.broadcast).toBeNull();
      expect(second.broadcast).toBeNull();
    });
  });
});

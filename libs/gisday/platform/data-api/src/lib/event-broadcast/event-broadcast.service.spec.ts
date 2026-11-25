import type { Mock } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository, getMetadataArgsStorage } from 'typeorm';

import { EventBroadcast, Place } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { EventBroadcastService } from './event-broadcast.service';
import { EventBroadcastController } from './event-broadcast.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtGuard, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

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
            find: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            manager: { transaction: vi.fn() }
          }
        },
        { provide: SeasonService, useValue: { findOne: vi.fn(), findOneActive: vi.fn() } }
      ]
    }).compile();

    service = module.get<EventBroadcastService>(EventBroadcastService);
    broadcastRepo = module.get(getRepositoryToken(EventBroadcast));
    seasonService = module.get(SeasonService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getEntities()', () => {
    it('lists broadcasts ordered by name', async () => {
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getEntities()).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({ relations: { place: true }, order: { name: 'ASC' } });
    });
  });

  describe('.getBroadcastsForSeason()', () => {
    it('scopes to the season and orders by name', async () => {
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getBroadcastsForSeason('season-1')).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'season-1' } },
        relations: { place: true },
        order: { name: 'ASC' }
      });
    });
  });

  describe('.getBroadcastsForActiveSeason()', () => {
    it('reads broadcasts for whichever season is active', async () => {
      vi.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([{ guid: 'b-1' } as EventBroadcast]);

      await expect(service.getBroadcastsForActiveSeason()).resolves.toEqual([{ guid: 'b-1' }]);
      expect(broadcastRepo.find).toHaveBeenCalledWith({
        where: { season: { guid: 'active' } },
        relations: { place: true },
        order: { name: 'ASC' }
      });
    });

    it('surfaces NotFound when no season is active', async () => {
      // The season lookup sits outside the try, so this one propagates untouched. It also reads
      // `season.guid` without a null check, which is safe only because `findOneActive` throws
      // rather than resolving null.
      vi
        .spyOn(seasonService, 'findOneActive')
        .mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getBroadcastsForActiveSeason()).rejects.toThrow(NotFoundException);
    });
  });

  describe('the order broadcasts are listed in (#3047)', () => {
    // As the database returns them: the one added last first, numbers compared as text, and mixed case.
    const unsorted = ['Zoom 4', 'TTU 1', 'TAMU Zoom 10', 'tamu zoom 2', 'TAMU Zoom 1', ' ATX'].map(
      (name, i) => ({ guid: `b-${i}`, name }) as EventBroadcast
    );
    const natural = [' ATX', 'TAMU Zoom 1', 'tamu zoom 2', 'TAMU Zoom 10', 'TTU 1', 'Zoom 4'];
    const names = (rows: Array<Partial<EventBroadcast>>) => rows.map((row) => row.name);

    beforeEach(() => {
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([...unsorted]);
      vi.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
    });

    it("lists a season's broadcasts by name, ignoring case, with numbers in order", async () => {
      expect(names(await service.getBroadcastsForSeason('season-1'))).toEqual(natural);
    });

    it("lists the active season's broadcasts, which every Broadcast drop-down reads, the same way", async () => {
      expect(names(await service.getBroadcastsForActiveSeason())).toEqual(natural);
    });

    it('lists every broadcast the same way', async () => {
      expect(names(await service.getEntities())).toEqual(natural);
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

      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([source]);
      vi.spyOn(broadcastRepo, 'create').mockImplementation((e) => e as never);
      vi.spyOn(broadcastRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await service.copyBroadcastsIntoSeason('season-2', ['b-1']);

      const passed = (broadcastRepo.create as Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.created).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      expect(passed.name).toBe('Zoom');
    });

    it('copies every requested broadcast', async () => {
      vi.spyOn(broadcastRepo, 'find').mockResolvedValue([
        { guid: 'b-1', name: 'Zoom' },
        { guid: 'b-2', name: 'Teams' }
      ] as EventBroadcast[]);
      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(broadcastRepo, 'create').mockImplementation((e) => e as never);
      vi.spyOn(broadcastRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      const copied = await service.copyBroadcastsIntoSeason('season-2', ['b-1', 'b-2']);

      expect(copied).toHaveLength(2);
      expect(broadcastRepo.create).toHaveBeenCalledTimes(2);
    });

    /**
     * A failed lookup was wrapped as 422, so a database outage reached the client as "you sent something
     * unprocessable". Since the shared copy (#3324) it is not caught at all, and Nest answers it 500.
     */
    it('lets a lookup failure through rather than calling it the request\'s fault', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(broadcastRepo, 'find').mockRejectedValue(new Error('connection lost'));

      await expect(service.copyBroadcastsIntoSeason('season-2', ['b-1'])).rejects.toThrow('connection lost');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, Mock>) => {
      (broadcastRepo.manager.transaction as Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: vi.fn().mockResolvedValue([]),
        save: vi.fn(),
        delete: vi.fn().mockResolvedValue({ affected: 2 })
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
        find: vi.fn().mockResolvedValue([{ guid: 'b-1', events: [event] }]),
        save: vi.fn().mockResolvedValue([event]),
        delete: vi.fn().mockResolvedValue({ affected: 1 })
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
        find: vi.fn().mockResolvedValue([
          { guid: 'b-1', events: [first] },
          { guid: 'b-2', events: [second] }
        ]),
        save: vi.fn().mockResolvedValue([first, second]),
        delete: vi.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await service.deleteEntities(['b-1', 'b-2']);

      expect(manager.save).toHaveBeenCalledWith([first, second]);
      expect(first.broadcast).toBeNull();
      expect(second.broadcast).toBeNull();
    });
  });

  /** #3032: a broadcast's admin page lists the sessions that use it. */
  describe('.getSessions()', () => {
    it('gives the sessions that use the broadcast, each with its day and place, for the admin page', async () => {
      const sessions = [{ guid: 'e-1', name: 'Keynote' }];
      vi.spyOn(broadcastRepo, 'findOne').mockResolvedValue({ guid: 'b-1', events: sessions } as unknown as EventBroadcast);

      await expect(service.getSessions('b-1')).resolves.toEqual(sessions);
      expect(broadcastRepo.findOne).toHaveBeenCalledWith({
        where: { guid: 'b-1' },
        relations: { events: { day: true, location: { place: true } } }
      });
    });

    it('answers 404 for a broadcast that does not exist', async () => {
      vi.spyOn(broadcastRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getSessions('b-x')).rejects.toThrow(NotFoundException);
    });

    it('is for admins only: it lists sessions hidden from the public schedule too', () => {
      const handler = EventBroadcastController.prototype.getSessions;

      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual(expect.arrayContaining([JwtGuard, PermissionsGuard]));
      expect(Reflect.getMetadata('Permissions', handler)[0]).toEqual(['update:event-broadcasts']);
    });
  });
});

/**
 * #3048. A broadcast belongs to an organization (a place), as a venue does, so each site's admin can list only its own
 * organizations' Zooms. Every read the admin pages make carries it: the lists, which each site filters by it, and one
 * broadcast, whose page shows and saves it.
 */
describe("EventBroadcast's organization", () => {
  it('is a place, which may be empty until one is set', () => {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === EventBroadcast && r.propertyName === 'place'
    );

    expect(relation?.relationType).toBe('many-to-one');
    expect((relation?.type as () => unknown)()).toBe(Place);
    expect(relation?.options.nullable).toBe(true);
  });

  it('is read with one broadcast, for its admin page', async () => {
    const findOne = vi.fn().mockResolvedValue({ guid: 'b-1', place: { guid: 'tamu' } });
    const controller = new EventBroadcastController({ findOne } as unknown as EventBroadcastService);

    await controller.getEntity('b-1');

    expect(findOne).toHaveBeenCalledWith({ where: { guid: 'b-1' }, relations: { place: true } });
  });
});

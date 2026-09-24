import { InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { AssetsService } from '../assets/assets.service';
import { Asset, EventLocation, Place, PlaceLink } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { PlaceService } from './place.service';

describe('PlaceService', () => {
  let service: PlaceService;
  let placeRepo: Repository<Place>;
  let linkRepo: Repository<PlaceLink>;
  let seasonService: SeasonService;
  let assetService: AssetsService;

  /** Every read path goes through a query builder, so the mock has to be chainable. */
  const queryBuilder = (result: unknown, method: 'getMany' | 'getOne' = 'getMany') => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['leftJoinAndSelect', 'leftJoin', 'where', 'orderBy', 'addOrderBy']) {
      qb[m] = jest.fn(() => qb);
    }
    qb.getMany = jest.fn().mockResolvedValue(method === 'getMany' ? result : []);
    qb.getOne = jest.fn().mockResolvedValue(method === 'getOne' ? result : null);
    return qb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceService,
        {
          provide: getRepositoryToken(Place),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        { provide: getRepositoryToken(PlaceLink), useValue: { create: jest.fn((l) => l) } },
        { provide: AssetsService, useValue: { saveAsset: jest.fn() } },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    service = module.get<PlaceService>(PlaceService);
    placeRepo = module.get(getRepositoryToken(Place));
    linkRepo = module.get(getRepositoryToken(PlaceLink));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getPlacesForSeason()', () => {
    it('scopes to the season and orders places by name, links by label', async () => {
      const qb = queryBuilder([{ guid: 'p-1' }]);
      jest.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getPlacesForSeason('season-1')).resolves.toEqual([{ guid: 'p-1' }]);
      expect(qb.where).toHaveBeenCalledWith('season.guid = :seasonGuid', { seasonGuid: 'season-1' });
      expect(qb.orderBy).toHaveBeenCalledWith('place.name', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('links.label', 'ASC');
    });
  });

  describe('.getEntity() / .getEntities()', () => {
    it('fetches a single place with links and logos', async () => {
      const qb = queryBuilder({ guid: 'p-1' }, 'getOne');
      jest.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEntity('p-1')).resolves.toEqual({ guid: 'p-1' });
      expect(qb.where).toHaveBeenCalledWith('place.guid = :guid', { guid: 'p-1' });
    });

    it('lists places ordered by name', async () => {
      const qb = queryBuilder([{ guid: 'p-1' }]);
      jest.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEntities()).resolves.toEqual([{ guid: 'p-1' }]);
      expect(qb.orderBy).toHaveBeenCalledWith('place.name', 'ASC');
    });
  });

  /**
   * These four methods raise an `HttpException` from inside their own `try`, and the `catch` used
   * to re-wrap it as `InternalServerErrorException` -- so every one of them answered 500 and the
   * caller could not tell "not found" from "server broke". Each catch in this library now
   * re-throws an `HttpException` unchanged before wrapping anything else.
   *
   * A genuine database failure is still wrapped, which the last test here pins down: the guard
   * must not turn every error into a pass-through.
   */
  describe('HTTP status preservation', () => {
    it('answers 404 when updating a place that does not exist', async () => {
      jest.spyOn(placeRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updatePlace('missing', { name: 'Alpha' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('answers 404 when no season is active', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getPlacesForActiveSeason()).rejects.toThrow(NotFoundException);
    });

    it('answers 422 when copying into a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(service.copyPlacesIntoSeason('missing', ['p-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('answers 422 when there is nothing to copy', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(placeRepo, 'find').mockResolvedValue([]);

      await expect(service.copyPlacesIntoSeason('season-2', ['p-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('still wraps a genuine database failure as 500', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(placeRepo, 'find').mockRejectedValue(new Error('connection lost'));

      await expect(service.copyPlacesIntoSeason('season-2', ['p-1'])).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });

  describe('.getPlacesForActiveSeason()', () => {
    it('resolves the active season and reads places against it', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      const qb = queryBuilder([{ guid: 'p-1' }]);
      jest.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getPlacesForActiveSeason()).resolves.toEqual([{ guid: 'p-1' }]);
      expect(qb.where).toHaveBeenCalledWith('season.guid = :seasonGuid', { seasonGuid: 'active' });
    });
  });

  describe('.copyPlacesIntoSeason()', () => {
    it('strips identity from the place, its logos and its links', async () => {
      const source = {
        guid: 'p-1',
        created: new Date(),
        updated: new Date(),
        name: 'Alpha',
        logos: [{ guid: 'a-1', created: new Date(), updated: new Date() }],
        links: [{ guid: 'l-1', created: new Date(), updated: new Date(), label: 'Map' }]
      } as unknown as Place;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(placeRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(placeRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await service.copyPlacesIntoSeason('season-2', ['p-1']);

      const passed = (placeRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      expect(passed.logos[0].guid).toBeUndefined();
      // The links branch discards its `.map()` result, unlike the logos branch. `delete` mutates
      // each link in place, so identity is still stripped -- asserting that so the difference is
      // recorded rather than assumed harmless.
      expect(passed.links[0].guid).toBeUndefined();
      expect(passed.links[0].label).toBe('Map');
    });
  });

  describe('.createPlace()', () => {
    it('parses the stringified links payload and creates each one', async () => {
      const saved = { guid: 'p-new' } as Place;
      jest.spyOn(placeRepo, 'create').mockReturnValue(saved);
      jest.spyOn(placeRepo, 'save').mockResolvedValue(saved);

      await service.createPlace({
        name: 'Alpha',
        links: JSON.stringify([{ guid: 'should-be-dropped', label: 'Map' }])
      } as unknown as Partial<Place>);

      // formData sends links as a JSON string; a guid on an incoming link would otherwise
      // re-parent an existing link onto this new place.
      expect(linkRepo.create).toHaveBeenCalledWith(expect.objectContaining({ label: 'Map' }));
      expect((linkRepo.create as jest.Mock).mock.calls[0][0].guid).toBeUndefined();
    });

    it('parses stringified visibilitySettings', async () => {
      jest.spyOn(placeRepo, 'create').mockReturnValue({ guid: 'p-new' } as Place);
      jest.spyOn(placeRepo, 'save').mockResolvedValue({ guid: 'p-new' } as Place);

      await service.createPlace({
        name: 'Alpha',
        visibilitySettings: JSON.stringify({ showOnMap: true })
      } as unknown as Partial<Place>);

      expect((placeRepo.create as jest.Mock).mock.calls[0][0].visibilitySettings).toEqual({
        showOnMap: true
      });
    });

    it('saves a logo and persists a second time when a file is supplied', async () => {
      const saved = { guid: 'p-new' } as Place & { save: jest.Mock };
      saved.save = jest.fn().mockResolvedValue(saved);
      jest.spyOn(placeRepo, 'create').mockReturnValue(saved);
      jest.spyOn(placeRepo, 'save').mockResolvedValue(saved);
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-1' } as never);

      await service.createPlace({ name: 'Alpha' }, { originalname: 'logo.png' } as never);

      expect(assetService.saveAsset).toHaveBeenCalledWith(
        'images/places',
        expect.anything(),
        'place-logo'
      );
      expect(saved.logos).toEqual([{ guid: 'a-1' }]);
    });

    it('does not reach the asset service when no file is supplied', async () => {
      jest.spyOn(placeRepo, 'create').mockReturnValue({ guid: 'p-new' } as Place);
      jest.spyOn(placeRepo, 'save').mockResolvedValue({ guid: 'p-new' } as Place);

      await service.createPlace({ name: 'Alpha' });

      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });
  });

  describe('.updatePlace()', () => {
    it('keeps an existing link that arrives with a guid, and creates one that does not', async () => {
      jest.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);
      jest.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', {
        name: 'Alpha',
        links: JSON.stringify([{ guid: 'l-existing', label: 'Old' }, { label: 'New' }])
      } as unknown as Partial<Place>);

      const saved = (placeRepo.save as jest.Mock).mock.calls[0][0];
      expect(saved.links).toEqual([
        { guid: 'l-existing', label: 'Old' },
        expect.objectContaining({ label: 'New' })
      ]);
    });

    it('leaves existing logos attached when no replacement file is supplied', async () => {
      jest
        .spyOn(placeRepo, 'findOne')
        .mockResolvedValue({ guid: 'p-1', logos: [{ guid: 'a-1' }] } as unknown as Place);
      jest.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', { name: 'Beta' });

      expect('logos' in (placeRepo.save as jest.Mock).mock.calls[0][0]).toBe(false);
    });

    it('does not let the caller overwrite the guid', async () => {
      jest.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);
      jest.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', { guid: 'p-hijack', name: 'Beta' } as Partial<Place>);

      expect((placeRepo.save as jest.Mock).mock.calls[0][0].guid).toBe('p-1');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, jest.Mock>) => {
      (placeRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 2 }),
        save: jest.fn()
      };
      withManager(manager);

      await service.deleteEntities('p-1,p-2');
      expect(manager.delete).toHaveBeenLastCalledWith(Place, ['p-1', 'p-2']);

      await service.deleteEntities(['p-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(Place, ['p-3']);
    });

    it('detaches event locations from the place before deleting it', async () => {
      const location = { guid: 'el-1', place: { guid: 'p-1' } } as EventLocation;
      const manager = {
        find: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([location]),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        save: jest.fn().mockResolvedValue([location])
      };
      withManager(manager);

      await service.deleteEntities(['p-1']);

      expect(location.place).toBeNull();
      expect(manager.save).toHaveBeenCalledWith([location]);
    });

    it('removes logo assets belonging to the places being deleted', async () => {
      const logo = { guid: 'a-1' } as Asset;
      const manager = {
        find: jest.fn().mockResolvedValueOnce([{ guid: 'p-1', logos: [logo] }]).mockResolvedValueOnce([]),
        delete: jest.fn().mockResolvedValue({ affected: 1 }),
        save: jest.fn()
      };
      withManager(manager);

      await service.deleteEntities(['p-1']);

      expect(manager.delete).toHaveBeenCalledWith(Asset, [logo]);
    });
  });
});

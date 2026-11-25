import type { Mock } from 'vitest';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { declaredPng } from '@tamu-gisc/common/node/images';

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
    const qb: Record<string, Mock> = {};
    for (const m of ['leftJoinAndSelect', 'leftJoin', 'where', 'orderBy', 'addOrderBy']) {
      qb[m] = vi.fn(() => qb);
    }
    qb.getMany = vi.fn().mockResolvedValue(method === 'getMany' ? result : []);
    qb.getOne = vi.fn().mockResolvedValue(method === 'getOne' ? result : null);
    return qb;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaceService,
        {
          provide: getRepositoryToken(Place),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            createQueryBuilder: vi.fn(),
            manager: { transaction: vi.fn() }
          }
        },
        { provide: getRepositoryToken(PlaceLink), useValue: { create: vi.fn((l) => l) } },
        {
          provide: AssetsService,
          useValue: { saveAsset: vi.fn(), deleteAssets: vi.fn(), deleteAssetFiles: vi.fn() }
        },
        { provide: SeasonService, useValue: { findOne: vi.fn(), findOneActive: vi.fn() } }
      ]
    }).compile();

    service = module.get<PlaceService>(PlaceService);
    placeRepo = module.get(getRepositoryToken(Place));
    linkRepo = module.get(getRepositoryToken(PlaceLink));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.getPlacesForSeason()', () => {
    it('scopes to the season and orders places by name, links by label', async () => {
      const qb = queryBuilder([{ guid: 'p-1' }]);
      vi.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getPlacesForSeason('season-1')).resolves.toEqual([{ guid: 'p-1' }]);
      expect(qb.where).toHaveBeenCalledWith('season.guid = :seasonGuid', { seasonGuid: 'season-1' });
      expect(qb.orderBy).toHaveBeenCalledWith('place.name', 'ASC');
      expect(qb.addOrderBy).toHaveBeenCalledWith('links.label', 'ASC');
    });
  });

  describe('.getEntity() / .getEntities()', () => {
    it('fetches a single place with links and logos', async () => {
      const qb = queryBuilder({ guid: 'p-1' }, 'getOne');
      vi.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

      await expect(service.getEntity('p-1')).resolves.toEqual({ guid: 'p-1' });
      expect(qb.where).toHaveBeenCalledWith('place.guid = :guid', { guid: 'p-1' });
    });

    it('lists places ordered by name', async () => {
      const qb = queryBuilder([{ guid: 'p-1' }]);
      vi.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

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
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updatePlace('missing', { name: 'Alpha' })).rejects.toThrow(NotFoundException);
    });

    it('answers 404 when no season is active', async () => {
      vi.spyOn(seasonService, 'findOneActive').mockRejectedValue(new NotFoundException('No active season found.'));

      await expect(service.getPlacesForActiveSeason()).rejects.toThrow(NotFoundException);
    });

    it('answers 422 when copying into a season that does not exist', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(service.copyPlacesIntoSeason('missing', ['p-1'])).rejects.toThrow(UnprocessableEntityException);
    });

    it('answers 422 when there is nothing to copy', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(placeRepo, 'find').mockResolvedValue([]);

      await expect(service.copyPlacesIntoSeason('season-2', ['p-1'])).rejects.toThrow(UnprocessableEntityException);
    });

    // Let through, as the shared copy does every lookup failure (#3379); Nest answers it 500 as before.
    it('lets a genuine database failure through, not as a refusal', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(placeRepo, 'find').mockRejectedValue(new Error('connection lost'));

      await expect(service.copyPlacesIntoSeason('season-2', ['p-1'])).rejects.toThrow('connection lost');
    });
  });

  describe('.getPlacesForActiveSeason()', () => {
    it('resolves the active season and reads places against it', async () => {
      vi.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      const qb = queryBuilder([{ guid: 'p-1' }]);
      vi.spyOn(placeRepo, 'createQueryBuilder').mockReturnValue(qb as never);

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

      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(placeRepo, 'find').mockResolvedValue([source]);
      vi.spyOn(placeRepo, 'create').mockImplementation(
        (e) => ({ ...(e as object), save: vi.fn().mockResolvedValue(e) }) as never
      );

      await service.copyPlacesIntoSeason('season-2', ['p-1']);

      const passed = (placeRepo.create as Mock).mock.calls[0][0];
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
      vi.spyOn(placeRepo, 'create').mockReturnValue(saved);
      vi.spyOn(placeRepo, 'save').mockResolvedValue(saved);

      await service.createPlace({
        name: 'Alpha',
        links: JSON.stringify([{ guid: 'should-be-dropped', label: 'Map' }])
      } as unknown as Partial<Place>);

      // formData sends links as a JSON string; a guid on an incoming link would otherwise
      // re-parent an existing link onto this new place.
      expect(linkRepo.create).toHaveBeenCalledWith(expect.objectContaining({ label: 'Map' }));
      expect((linkRepo.create as Mock).mock.calls[0][0].guid).toBeUndefined();
    });

    it('parses stringified visibilitySettings', async () => {
      vi.spyOn(placeRepo, 'create').mockReturnValue({ guid: 'p-new' } as Place);
      vi.spyOn(placeRepo, 'save').mockResolvedValue({ guid: 'p-new' } as Place);

      await service.createPlace({
        name: 'Alpha',
        visibilitySettings: JSON.stringify({ showOnMap: true })
      } as unknown as Partial<Place>);

      expect((placeRepo.create as Mock).mock.calls[0][0].visibilitySettings).toEqual({
        showOnMap: true
      });
    });

    it('saves a logo and persists a second time when a file is supplied', async () => {
      const saved = { guid: 'p-new' } as Place & { save: Mock };
      saved.save = vi.fn().mockResolvedValue(saved);
      vi.spyOn(placeRepo, 'create').mockReturnValue(saved);
      vi.spyOn(placeRepo, 'save').mockResolvedValue(saved);
      vi.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-1' } as never);

      await service.createPlace({ name: 'Alpha' }, { originalname: 'logo.png', buffer: declaredPng(10, 10) } as never);

      expect(assetService.saveAsset).toHaveBeenCalledWith('images/places', expect.anything(), 'place-logo');
      expect(saved.logos).toEqual([{ guid: 'a-1' }]);
    });

    it('does not reach the asset service when no file is supplied', async () => {
      vi.spyOn(placeRepo, 'create').mockReturnValue({ guid: 'p-new' } as Place);
      vi.spyOn(placeRepo, 'save').mockResolvedValue({ guid: 'p-new' } as Place);

      await service.createPlace({ name: 'Alpha' });

      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });
  });

  describe('.updatePlace()', () => {
    it('keeps an existing link that arrives with a guid, and creates one that does not', async () => {
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);
      vi.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', {
        name: 'Alpha',
        links: JSON.stringify([{ guid: 'l-existing', label: 'Old' }, { label: 'New' }])
      } as unknown as Partial<Place>);

      const saved = (placeRepo.save as Mock).mock.calls[0][0];
      expect(saved.links).toEqual([{ guid: 'l-existing', label: 'Old' }, expect.objectContaining({ label: 'New' })]);
    });

    it('leaves existing logos attached when no replacement file is supplied', async () => {
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [{ guid: 'a-1' }] } as unknown as Place);
      vi.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', { name: 'Beta' });

      expect('logos' in (placeRepo.save as Mock).mock.calls[0][0]).toBe(false);
    });

    it('does not let the caller overwrite the guid', async () => {
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);
      vi.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', { guid: 'p-hijack', name: 'Beta' } as Partial<Place>);

      expect((placeRepo.save as Mock).mock.calls[0][0].guid).toBe('p-1');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, Mock>) => {
      (placeRepo.manager.transaction as Mock).mockImplementation((cb) => cb(manager));
    };
    // The manager's finds by entity, each with no rows unless given: the places, their broadcasts (#3397) and their
    // event locations are read in turn, so answering by call order broke when a read was added.
    const findsOf = (rows: Map<unknown, Array<unknown>>) =>
      vi.fn().mockImplementation(async (entity) => rows.get(entity) ?? []);

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({ affected: 2 }),
        save: vi.fn()
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
        find: findsOf(new Map([[EventLocation, [location]]])),
        delete: vi.fn().mockResolvedValue({ affected: 1 }),
        save: vi.fn().mockResolvedValue([location])
      };
      withManager(manager);

      await service.deleteEntities(['p-1']);

      expect(location.place).toBeNull();
      expect(manager.save).toHaveBeenCalledWith([location]);
    });

    it('removes logo assets belonging to the places being deleted', async () => {
      const logo = { guid: 'a-1' } as Asset;
      const manager = {
        find: findsOf(new Map([[Place, [{ guid: 'p-1', logos: [logo] }]]])),
        delete: vi.fn().mockResolvedValue({ affected: 1 }),
        save: vi.fn()
      };
      withManager(manager);

      await service.deleteEntities(['p-1']);

      // Through AssetsService, which deletes the rows by guid and their files after commit (#2205).
      expect(assetService.deleteAssets).toHaveBeenCalledWith(manager, [logo]);
      expect(assetService.deleteAssetFiles).toHaveBeenCalledWith([logo]);
    });
  });

  /**
   * #2937. A logo is served from the site's own origin, and an SVG can carry script, so only a JPEG or PNG is taken, judged
   * by its content: an SVG named .png is still an SVG.
   */
  describe('logo uploads (#2937)', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>');
    const upload = (originalname: string, buffer: Buffer) =>
      ({ originalname, mimetype: 'image/png', buffer, size: buffer.length }) as Express.Multer.File;

    it.each([
      ['an SVG', upload('logo.svg', svg)],
      ['an SVG renamed to .png', upload('logo.png', svg)]
    ])('refuses %s on create with 400, and creates no place', async (_name, file) => {
      vi.spyOn(placeRepo, 'create').mockReturnValue({ guid: 'p-new' } as Place);

      await expect(service.createPlace({ name: 'Alpha' }, file)).rejects.toThrow(BadRequestException);
      expect(placeRepo.save).not.toHaveBeenCalled();
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('refuses an SVG renamed to .png on update with 400', async () => {
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);

      await expect(service.updatePlace('p-1', { name: 'Alpha' }, upload('logo.png', svg))).rejects.toThrow(
        BadRequestException
      );
      expect(assetService.saveAsset).not.toHaveBeenCalled();
      expect(placeRepo.save).not.toHaveBeenCalled();
    });

    it('stores a PNG named .svg under a .png name', async () => {
      vi.spyOn(placeRepo, 'findOne').mockResolvedValue({ guid: 'p-1', logos: [] } as unknown as Place);
      vi.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-2' } as never);
      vi.spyOn(placeRepo, 'save').mockImplementation((e) => Promise.resolve(e as Place));

      await service.updatePlace('p-1', { name: 'Alpha' }, upload('logo.svg', declaredPng(10, 10)));

      expect((assetService.saveAsset as Mock).mock.calls[0][1].originalname).toBe('logo.png');
    });
  });
});

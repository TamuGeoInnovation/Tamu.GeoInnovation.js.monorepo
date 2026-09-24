import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { AssetsService } from '../assets/assets.service';
import { Asset, Sponsor } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { SponsorProvider } from './sponsor.provider';

describe('SponsorProvider', () => {
  let provider: SponsorProvider;
  let sponsorRepo: Repository<Sponsor>;
  let seasonService: SeasonService;
  let assetService: AssetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SponsorProvider,
        {
          provide: getRepositoryToken(Sponsor),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            manager: { transaction: jest.fn() }
          }
        },
        { provide: AssetsService, useValue: { saveAsset: jest.fn() } },
        { provide: SeasonService, useValue: { findOne: jest.fn(), findOneActive: jest.fn() } }
      ]
    }).compile();

    provider = module.get<SponsorProvider>(SponsorProvider);
    sponsorRepo = module.get(getRepositoryToken(Sponsor));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getSponsorsForSeason()', () => {
    it('resolves the season first and scopes the lookup to it', async () => {
      const season = { guid: 'season-1' };
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      jest.spyOn(sponsorRepo, 'find').mockResolvedValue([{ guid: 'sp-1' } as Sponsor]);

      await expect(provider.getSponsorsForSeason('season-1')).resolves.toEqual([{ guid: 'sp-1' }]);
      expect(sponsorRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { season }, order: { name: 'ASC' } })
      );
    });

    /**
     * The 422 is raised inside this method's own `try`. It survives to the caller only because of
     * the HttpException guard added in #976 -- without it the catch would have reported 500.
     */
    it('answers 422, not 500, for a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.getSponsorsForSeason('missing')).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });

  describe('.copyEntitiesIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.copyEntitiesIntoSeason('missing', ['sp-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when none of the requested sponsors exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(sponsorRepo, 'find').mockResolvedValue([]);

      await expect(provider.copyEntitiesIntoSeason('season-2', ['sp-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity from the sponsor and its logos', async () => {
      const source = {
        guid: 'sp-1',
        created: new Date(),
        updated: new Date(),
        name: 'Esri',
        logos: [{ guid: 'a-1', created: new Date(), updated: new Date() }]
      } as unknown as Sponsor;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(sponsorRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(sponsorRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await provider.copyEntitiesIntoSeason('season-2', ['sp-1']);

      const passed = (sponsorRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      // The logo is a separate row; carrying its guid would move it off the original sponsor.
      expect(passed.logos[0].guid).toBeUndefined();
      expect(passed.name).toBe('Esri');
    });
  });

  describe('.createSponsor()', () => {
    it('saves without touching assets when no file is supplied', async () => {
      const save = jest.fn().mockResolvedValue({ guid: 'sp-new' });
      jest.spyOn(sponsorRepo, 'create').mockReturnValue({ save } as never);

      await expect(provider.createSponsor({ name: 'Esri' })).resolves.toEqual({ guid: 'sp-new' });
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('attaches a saved logo and persists a second time when a file is supplied', async () => {
      const saved = { guid: 'sp-new' } as Sponsor & { save: jest.Mock };
      saved.save = jest.fn().mockResolvedValue(saved);
      jest.spyOn(sponsorRepo, 'create').mockReturnValue({ save: jest.fn().mockResolvedValue(saved) } as never);
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-1' } as never);

      await provider.createSponsor({ name: 'Esri' }, { originalname: 'logo.png' } as never);

      expect(assetService.saveAsset).toHaveBeenCalledWith(
        'images/sponsors',
        expect.anything(),
        'sponsor-logo'
      );
      expect(saved.logos).toEqual([{ guid: 'a-1' }]);
    });
  });

  describe('.updateSponsor()', () => {
    it('throws NotFound when the sponsor does not exist', async () => {
      jest.spyOn(sponsorRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateSponsor('missing', { name: 'Esri' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('leaves existing logos attached when no replacement file is supplied', async () => {
      jest
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [{ guid: 'a-1' }] } as unknown as Sponsor);
      jest.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri UK' });

      // `logos` is removed from the payload rather than sent as `[undefined]`, which would detach
      // the existing logo.
      expect('logos' in (sponsorRepo.save as jest.Mock).mock.calls[0][0]).toBe(false);
    });

    it('replaces the logo when a file is supplied', async () => {
      jest
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-2' } as never);
      jest.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri' }, { originalname: 'logo.png' } as never);

      expect((sponsorRepo.save as jest.Mock).mock.calls[0][0].logos).toEqual([{ guid: 'a-2' }]);
    });

    it('does not let the caller overwrite the guid', async () => {
      jest
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);
      jest.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { guid: 'sp-hijack', name: 'Esri' } as Partial<Sponsor>);

      expect((sponsorRepo.save as jest.Mock).mock.calls[0][0].guid).toBe('sp-1');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, jest.Mock>) => {
      (sponsorRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await provider.deleteEntities('sp-1,sp-2');
      expect(manager.delete).toHaveBeenLastCalledWith(Sponsor, ['sp-1', 'sp-2']);

      await provider.deleteEntities(['sp-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(Sponsor, ['sp-3']);
    });

    it('removes the logos belonging to the sponsors being deleted', async () => {
      const logo = { guid: 'a-1' } as Asset;
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 'sp-1', logos: [logo] }]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['sp-1']);

      expect(manager.delete).toHaveBeenCalledWith(Asset, [logo]);
    });

    it('does not attempt a logo delete when there are none', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 'sp-1', logos: [] }]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['sp-1']);

      // A delete with an empty list would remove every asset in the table on some drivers.
      expect(manager.delete).toHaveBeenCalledTimes(1);
      expect(manager.delete).toHaveBeenCalledWith(Sponsor, ['sp-1']);
    });
  });
});

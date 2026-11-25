import type { Mock } from 'vitest';
import { BadRequestException, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { declaredPng } from '@tamu-gisc/common/node/images';

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
            find: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            manager: { transaction: vi.fn() }
          }
        },
        {
          provide: AssetsService,
          useValue: { saveAsset: vi.fn(), deleteAssets: vi.fn(), deleteAssetFiles: vi.fn() }
        },
        { provide: SeasonService, useValue: { findOne: vi.fn(), findOneActive: vi.fn() } }
      ]
    }).compile();

    provider = module.get<SponsorProvider>(SponsorProvider);
    sponsorRepo = module.get(getRepositoryToken(Sponsor));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getSponsorsForSeason()', () => {
    it('resolves the season first and scopes the lookup to it', async () => {
      const season = { guid: 'season-1' };
      vi.spyOn(seasonService, 'findOne').mockResolvedValue(season as never);
      vi.spyOn(sponsorRepo, 'find').mockResolvedValue([{ guid: 'sp-1' } as Sponsor]);

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
      vi.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.getSponsorsForSeason('missing')).rejects.toThrow(
        UnprocessableEntityException
      );
    });
  });

  describe('.copyEntitiesIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.copyEntitiesIntoSeason('missing', ['sp-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when none of the requested sponsors exist', async () => {
      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(sponsorRepo, 'find').mockResolvedValue([]);

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

      vi.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      vi.spyOn(sponsorRepo, 'find').mockResolvedValue([source]);
      vi
        .spyOn(sponsorRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: vi.fn().mockResolvedValue(e) }) as never);

      await provider.copyEntitiesIntoSeason('season-2', ['sp-1']);

      const passed = (sponsorRepo.create as Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      // The logo is a separate row; carrying its guid would move it off the original sponsor.
      expect(passed.logos[0].guid).toBeUndefined();
      expect(passed.name).toBe('Esri');
    });
  });

  describe('.createSponsor()', () => {
    it('saves without touching assets when no file is supplied', async () => {
      const save = vi.fn().mockResolvedValue({ guid: 'sp-new' });
      vi.spyOn(sponsorRepo, 'create').mockReturnValue({ save } as never);

      await expect(provider.createSponsor({ name: 'Esri' })).resolves.toEqual({ guid: 'sp-new' });
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('creates a sponsor with the logo size given, and without one that is not a size (#2638)', async () => {
      vi.spyOn(sponsorRepo, 'create').mockReturnValue({ save: vi.fn().mockResolvedValue({}) } as never);

      await provider.createSponsor({ name: 'Bush School', logoSize: 'large' });
      await provider.createSponsor({ name: 'Esri', logoSize: '' } as unknown as Partial<Sponsor>);

      const created = (sponsorRepo.create as Mock).mock.calls.map((c) => c[0]);
      expect(created[0].logoSize).toBe('large');
      expect('logoSize' in created[1]).toBe(false);
    });

    it('attaches a saved logo and persists a second time when a file is supplied', async () => {
      const saved = { guid: 'sp-new' } as Sponsor & { save: Mock };
      saved.save = vi.fn().mockResolvedValue(saved);
      vi.spyOn(sponsorRepo, 'create').mockReturnValue({ save: vi.fn().mockResolvedValue(saved) } as never);
      vi.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-1' } as never);

      await provider.createSponsor({ name: 'Esri' }, { originalname: 'logo.png', buffer: declaredPng(10, 10) } as never);

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
      vi.spyOn(sponsorRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateSponsor('missing', { name: 'Esri' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('leaves existing logos attached when no replacement file is supplied', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [{ guid: 'a-1' }] } as unknown as Sponsor);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri UK' });

      // `logos` is removed from the payload rather than sent as `[undefined]`, which would detach
      // the existing logo.
      expect('logos' in (sponsorRepo.save as Mock).mock.calls[0][0]).toBe(false);
    });

    it('replaces the logo when a file is supplied', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);
      vi.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-2' } as never);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri' }, { originalname: 'logo.png', buffer: declaredPng(10, 10) } as never);

      expect((sponsorRepo.save as Mock).mock.calls[0][0].logos).toEqual([{ guid: 'a-2' }]);
    });

    /**
     * #1962. Form data sends every value as text, so "false" would otherwise be saved as a truthy
     * string and a sponsor could never be switched off from the admin form.
     */
    it('switches a sponsor off and on from form data or JSON', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', active: true, logos: [] } as unknown as Sponsor);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { active: 'false' } as unknown as Partial<Sponsor>);
      await provider.updateSponsor('sp-1', { active: true });

      const saved = (sponsorRepo.save as Mock).mock.calls.map((c) => c[0].active);
      expect(saved).toEqual([false, true]);
    });

    it('leaves the active flag alone when an update does not mention it', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', active: false, logos: [] } as unknown as Sponsor);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri' });

      expect((sponsorRepo.save as Mock).mock.calls[0][0].active).toBe(false);
    });

    /**
     * #2638. The size decides a CSS class on the public page, so only the four it draws are kept.
     */
    it('keeps a logo size the page draws and leaves out any other', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logoSize: 'regular', logos: [] } as unknown as Sponsor);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { logoSize: 'extra-large' });
      await provider.updateSponsor('sp-1', { logoSize: 'huge' } as unknown as Partial<Sponsor>);
      await provider.updateSponsor('sp-1', { name: 'Esri' });

      const saved = (sponsorRepo.save as Mock).mock.calls.map((c) => c[0].logoSize);
      expect(saved).toEqual(['extra-large', 'regular', 'regular']);
    });

    it('does not let the caller overwrite the guid', async () => {
      vi
        .spyOn(sponsorRepo, 'findOne')
        .mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { guid: 'sp-hijack', name: 'Esri' } as Partial<Sponsor>);

      expect((sponsorRepo.save as Mock).mock.calls[0][0].guid).toBe('sp-1');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, Mock>) => {
      (sponsorRepo.manager.transaction as Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await provider.deleteEntities('sp-1,sp-2');
      expect(manager.delete).toHaveBeenLastCalledWith(Sponsor, ['sp-1', 'sp-2']);

      await provider.deleteEntities(['sp-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(Sponsor, ['sp-3']);
    });

    /**
     * A logo as the database returns it: every column, timestamps included. Passing rows like this
     * to `manager.delete` made TypeORM match on every column, which on SQL Server matched nothing,
     * so the sponsor's delete then failed on the logo's foreign key and answered 500 (#2205).
     */
    it('deletes a sponsor with a logo: the logo row by its guid, then its file once the delete commits', async () => {
      const logo = {
        guid: 'a-1',
        name: 'logo.png',
        path: 'images/sponsors/logo.png',
        type: 'sponsor-logo',
        created: new Date('2026-10-23T18:00:00.123Z'),
        updated: new Date('2026-10-23T18:00:00.123Z')
      } as Asset;
      const manager = {
        find: vi.fn().mockResolvedValue([{ guid: 'sp-1', logos: [logo] }]),
        delete: vi.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await expect(provider.deleteEntities(['sp-1'])).resolves.toEqual({ affected: 1 });

      expect(assetService.deleteAssets).toHaveBeenCalledWith(manager, [logo]);
      expect(manager.delete).toHaveBeenCalledWith(Sponsor, ['sp-1']);
      expect(assetService.deleteAssetFiles).toHaveBeenCalledWith([logo]);
    });

    it('does not attempt a logo delete when there are none', async () => {
      const manager = {
        find: vi.fn().mockResolvedValue([{ guid: 'sp-1', logos: [] }]),
        delete: vi.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['sp-1']);

      // AssetsService.deleteAssets skips an empty list (its own spec covers that); here, only the sponsor goes.
      expect(assetService.deleteAssets).toHaveBeenCalledWith(manager, []);
      expect(manager.delete).toHaveBeenCalledTimes(1);
      expect(manager.delete).toHaveBeenCalledWith(Sponsor, ['sp-1']);
    });

    /**
     * The transaction's promise used to be returned from inside the `try`, so a failed delete
     * escaped the catch and reached the caller as the raw database error.
     */
    it('reports a failed delete as its own 500 and leaves the files alone', async () => {
      (sponsorRepo.manager.transaction as Mock).mockRejectedValue(new Error('REFERENCE constraint'));

      await expect(provider.deleteEntities(['sp-1'])).rejects.toThrow(InternalServerErrorException);
      expect(assetService.deleteAssetFiles).not.toHaveBeenCalled();
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
    ])('refuses %s on create with 400, and creates no sponsor', async (_name, file) => {
      const save = vi.fn().mockResolvedValue({ guid: 'sp-new', save: vi.fn() });
      vi.spyOn(sponsorRepo, 'create').mockReturnValue({ save } as never);

      await expect(provider.createSponsor({ name: 'Esri' }, file)).rejects.toThrow(BadRequestException);
      expect(save).not.toHaveBeenCalled();
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('refuses an SVG renamed to .png on update with 400', async () => {
      vi.spyOn(sponsorRepo, 'findOne').mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);

      await expect(provider.updateSponsor('sp-1', { name: 'Esri' }, upload('logo.png', svg))).rejects.toThrow(
        BadRequestException
      );
      expect(assetService.saveAsset).not.toHaveBeenCalled();
      expect(sponsorRepo.save).not.toHaveBeenCalled();
    });

    it('stores a PNG named .svg under a .png name', async () => {
      vi.spyOn(sponsorRepo, 'findOne').mockResolvedValue({ guid: 'sp-1', logos: [] } as unknown as Sponsor);
      vi.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'a-2' } as never);
      vi.spyOn(sponsorRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateSponsor('sp-1', { name: 'Esri' }, upload('logo.svg', declaredPng(10, 10)));

      expect((assetService.saveAsset as Mock).mock.calls[0][1].originalname).toBe('logo.png');
    });
  });
});

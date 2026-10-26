import { BadRequestException, NotFoundException, PayloadTooLargeException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { createJimp } from '@jimp/core';
import jpeg from '@jimp/js-jpeg';

import { declaredPng } from '@tamu-gisc/common/node/images';

import { AssetsService } from '../assets/assets.service';
import { Asset, Event, Organization, Season, Speaker, University } from '../entities/all.entity';
import { SeasonService } from '../season/season.service';
import { SpeakerProvider } from './speaker.provider';

const Jimp = createJimp({ formats: [jpeg] });

describe('SpeakerProvider', () => {
  let provider: SpeakerProvider;
  let speakerRepo: Repository<Speaker>;
  let eventRepo: Repository<Event>;
  let seasonService: SeasonService;
  let assetService: AssetsService;

  const repoMock = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    manager: { transaction: jest.fn() }
  });

  /** A speaker as it comes back on an event, with the fields `limitToPopulated` looks at. */
  const speaker = (guid: string, over: Record<string, unknown> = {}) =>
    ({ guid, firstName: 'A', lastName: 'B', description: 'A bio', images: [{ guid: 'i-1' }], ...over }) as unknown as Speaker;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeakerProvider,
        { provide: getRepositoryToken(Speaker), useValue: repoMock() },
        { provide: getRepositoryToken(Event), useValue: repoMock() },
        { provide: getRepositoryToken(Organization), useValue: repoMock() },
        { provide: getRepositoryToken(University), useValue: repoMock() },
        { provide: getRepositoryToken(Season), useValue: repoMock() },
        { provide: getRepositoryToken(Asset), useValue: repoMock() },
        {
          provide: AssetsService,
          useValue: { saveAsset: jest.fn(), deleteAssets: jest.fn(), deleteAssetFiles: jest.fn() }
        },
        {
          provide: SeasonService,
          useValue: { findOne: jest.fn(), findOneActive: jest.fn(), findOneWithDaysAndEvents: jest.fn() }
        }
      ]
    }).compile();

    provider = module.get<SpeakerProvider>(SpeakerProvider);
    speakerRepo = module.get(getRepositoryToken(Speaker));
    eventRepo = module.get(getRepositoryToken(Event));
    seasonService = module.get(SeasonService);
    assetService = module.get(AssetsService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('.getSpeakersForSeason()', () => {
    it('scopes to the season and orders by last then first name', async () => {
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([speaker('s-1')]);

      await expect(provider.getSpeakersForSeason('season-1')).resolves.toEqual([
        expect.objectContaining({ guid: 's-1' })
      ]);
      expect(speakerRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { season: { guid: 'season-1' } },
          order: { lastName: 'ASC', firstName: 'ASC' }
        })
      );
    });
  });

  describe('.getSpeakersForActiveSeasonInEvents()', () => {
    const activeSeason = (days: Array<unknown>) => ({ guid: 'active', days }) as unknown as Season;

    it('collects the speakers across every event in the season', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockResolvedValue(activeSeason([{ events: [{ guid: 'e-1' }, { guid: 'e-2' }] }]) as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [speaker('s-1')] },
        { guid: 'e-2', speakers: [speaker('s-2')] }
      ] as unknown as Event[]);

      const result = await provider.getSpeakersForActiveSeasonInEvents();

      expect(result.map((s) => s.guid)).toEqual(['s-1', 's-2']);
    });

    it('returns a speaker once even when they appear on several events', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockResolvedValue(activeSeason([{ events: [{ guid: 'e-1' }, { guid: 'e-2' }] }]) as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [speaker('s-1')] },
        { guid: 'e-2', speakers: [speaker('s-1')] }
      ] as unknown as Event[]);

      await expect(provider.getSpeakersForActiveSeasonInEvents()).resolves.toHaveLength(1);
    });

    it('keeps only speakers with both a bio and an image when asked to', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockResolvedValue(activeSeason([{ events: [{ guid: 'e-1' }] }]) as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        {
          guid: 'e-1',
          speakers: [
            speaker('s-complete'),
            speaker('s-no-bio', { description: '' }),
            speaker('s-no-image', { images: [] })
          ]
        }
      ] as unknown as Event[]);

      const result = await provider.getSpeakersForActiveSeasonInEvents(true);

      expect(result.map((s) => s.guid)).toEqual(['s-complete']);
    });

    it('keeps incomplete speakers when not asked to filter', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockResolvedValue(activeSeason([{ events: [{ guid: 'e-1' }] }]) as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [speaker('s-no-bio', { description: '' })] }
      ] as unknown as Event[]);

      await expect(provider.getSpeakersForActiveSeasonInEvents()).resolves.toHaveLength(1);
    });

    /**
     * Regression coverage.
     *
     * The guid collection reduced without an initial value:
     *
     *   season.days.map((day) => day.events.map((e) => e.guid)).reduce((acc, curr) => acc.concat(curr))
     *
     * `Array.prototype.reduce` on an empty array with no initial value throws
     * `TypeError: Reduce of empty array with no initial value`. So an active season with no days
     * yet -- exactly the state a season is in while it is being set up -- answered 500 instead of
     * an empty list. The reduce immediately below it passes `[]`, which is what this one wanted.
     */
    it('answers an empty list for an active season that has no days yet', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue(activeSeason([]) as never);
      const find = jest.spyOn(eventRepo, 'find').mockResolvedValue([]);

      await expect(provider.getSpeakersForActiveSeasonInEvents()).resolves.toEqual([]);
      // It does not short-circuit: the lookup still runs with an empty `In([])`. That is wasteful
      // rather than wrong, and is asserted so the behaviour is recorded rather than assumed.
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { guid: expect.anything() } })
      );
    });

    it('tolerates a day with no events on it', async () => {
      jest
        .spyOn(seasonService, 'findOneActive')
        .mockResolvedValue(activeSeason([{ events: [] }, { events: [{ guid: 'e-1' }] }]) as never);
      jest
        .spyOn(eventRepo, 'find')
        .mockResolvedValue([{ guid: 'e-1', speakers: [speaker('s-1')] }] as unknown as Event[]);

      await expect(provider.getSpeakersForActiveSeasonInEvents()).resolves.toHaveLength(1);
    });
  });

  describe('.getSpeakersForSeasonInEvents()', () => {
    const pastSeason = (days: Array<unknown>) => ({ guid: 'season-2025', year: 2025, days }) as unknown as Season;

    it('collects the speakers from the events of the season asked for, not the active one', async () => {
      const lookup = jest
        .spyOn(seasonService, 'findOneWithDaysAndEvents')
        .mockResolvedValue(pastSeason([{ events: [{ guid: 'e-2025' }] }]) as never);
      jest
        .spyOn(eventRepo, 'find')
        .mockResolvedValue([{ guid: 'e-2025', speakers: [speaker('s-2025')] }] as unknown as Event[]);

      const result = await provider.getSpeakersForSeasonInEvents('season-2025');

      expect(lookup).toHaveBeenCalledWith('season-2025');
      expect(seasonService.findOneActive).not.toHaveBeenCalled();
      expect(result.map((s) => s.guid)).toEqual(['s-2025']);
    });

    it('applies the same bio and image filter as the active season', async () => {
      jest
        .spyOn(seasonService, 'findOneWithDaysAndEvents')
        .mockResolvedValue(pastSeason([{ events: [{ guid: 'e-1' }] }]) as never);
      jest.spyOn(eventRepo, 'find').mockResolvedValue([
        { guid: 'e-1', speakers: [speaker('s-complete'), speaker('s-no-image', { images: [] })] }
      ] as unknown as Event[]);

      const result = await provider.getSpeakersForSeasonInEvents('season-2025', true);

      expect(result.map((s) => s.guid)).toEqual(['s-complete']);
    });
  });

  describe('organizer lookups', () => {
    it('restricts to organizers for a given season', async () => {
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([speaker('s-1')]);

      await provider.getOrganizersForSeason('season-1');

      expect(speakerRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isOrganizer: true, season: { guid: 'season-1' } }
        })
      );
    });

    it('restricts to organizers across every season', async () => {
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([speaker('s-1')]);

      await provider.getAllTimeOrganizers();

      expect(speakerRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isOrganizer: true } })
      );
    });

    it('restricts to organizers for whichever season is active', async () => {
      jest.spyOn(seasonService, 'findOneActive').mockResolvedValue({ guid: 'active' } as never);
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([speaker('s-1')]);

      await provider.getOrganizersForActiveSeason();

      expect(speakerRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isOrganizer: true, season: { guid: 'active' } }
        })
      );
    });
  });

  describe('.updateWithInfo()', () => {
    const existing = () =>
      ({ guid: 's-1', firstName: 'A', isOrganizer: true, images: [{ guid: 'i-1' }] }) as unknown as Speaker;

    it('throws NotFound when the speaker does not exist', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(null);

      await expect(provider.updateWithInfo('missing', {})).rejects.toThrow(NotFoundException);
    });

    /**
     * The admin form posts multipart form data, so booleans arrive as the strings "true" and
     * "false" -- hence the `=== 'true'` comparison. Worth pinning, because it also means a caller
     * sending a real JSON boolean `true` gets `false` stored.
     */
    it('reads the organizer flag from the string form data sends', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateWithInfo('s-1', { isOrganizer: 'true', isActive: 'false' } as never);

      const saved = (speakerRepo.save as jest.Mock).mock.calls[0][0];
      expect(saved.isOrganizer).toBe(true);
      expect(saved.isActive).toBe(false);
    });

    /**
     * Current behaviour, recorded rather than endorsed. Omitting the flags clears them, because
     * `undefined === 'true'` is false and the coerced value overwrites the spread of `existing`.
     * The admin form always sends them, so this does not bite there -- but a partial update from
     * anywhere else silently demotes an organizer.
     */
    it('clears the organizer flag when the field is omitted', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateWithInfo('s-1', { firstName: 'B' });

      expect((speakerRepo.save as jest.Mock).mock.calls[0][0].isOrganizer).toBe(false);
    });

    it('leaves existing images alone when no replacement file is supplied', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateWithInfo('s-1', { firstName: 'B' });

      expect('images' in (speakerRepo.save as jest.Mock).mock.calls[0][0]).toBe(false);
    });

    it('replaces the image when a file is supplied, prefixed with the speaker guid', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'i-2' } as never);

      await provider.updateWithInfo('s-1', {}, { originalname: 'face.png' });

      expect(assetService.saveAsset).toHaveBeenCalledWith(
        'images/speakers',
        expect.anything(),
        'speaker-image',
        { prefix: 's-1-' }
      );
      expect((speakerRepo.save as jest.Mock).mock.calls[0][0].images).toEqual([{ guid: 'i-2' }]);
    });

    // jimp is pure JavaScript, so a 3000 px photo takes a second or more; 30 s, not 5, under the full check's load.
    it('stores a large photo at the size the site shows it, not as uploaded (#2352)', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'i-2' } as never);
      const upload = await new Jimp({ width: 3000, height: 3000, color: 0x7f7f7fff }).getBuffer('image/jpeg');

      await provider.updateWithInfo('s-1', {}, { originalname: 'face.jpg', mimetype: 'image/jpeg', buffer: upload, size: upload.length });

      const stored = (assetService.saveAsset as jest.Mock).mock.calls[0][1];
      const { width, height } = (await Jimp.fromBuffer(stored.buffer)).bitmap;
      // Twice the 420 px a presenter's own page draws it at, for sharp screens.
      expect([width, height]).toEqual([840, 840]);
      expect(stored.size).toBe(stored.buffer.length);
      expect(stored.originalname).toBe('face.jpg');
    }, 30_000);

    it('refuses a small file that declares a huge image, before decoding it, with 413', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'i-2' } as never);
      // A few KB that would make the decoder allocate 50,000 x 50,000 x 4 bytes: 10 GB.
      const bomb = declaredPng(50_000, 50_000);
      expect(bomb.length).toBeLessThan(4096);

      await expect(
        provider.updateWithInfo('s-1', {}, { originalname: 'bomb.png', mimetype: 'image/png', buffer: bomb, size: bomb.length })
      ).rejects.toThrow(PayloadTooLargeException);
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('creates no speaker when the new speaker brings a photo that declares a huge image', async () => {
      const save = jest.fn();
      jest.spyOn(speakerRepo, 'create').mockReturnValue({ save } as never);
      const bomb = declaredPng(9000, 9000);

      await expect(
        provider.insertWithInfo({ firstName: 'A' }, { originalname: 'bomb.png', mimetype: 'image/png', buffer: bomb, size: bomb.length })
      ).rejects.toThrow(PayloadTooLargeException);
      expect(save).not.toHaveBeenCalled();
    });

    it('refuses a file whose header is not an image it can read, with 400', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(assetService, 'saveAsset').mockResolvedValue({ guid: 'i-2' } as never);
      const notAnImage = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

      await expect(
        provider.updateWithInfo('s-1', {}, { originalname: 'face.svg', mimetype: 'image/svg+xml', buffer: notAnImage, size: notAnImage.length })
      ).rejects.toThrow(BadRequestException);
      expect(assetService.saveAsset).not.toHaveBeenCalled();
    });

    it('does not let the caller overwrite the guid', async () => {
      jest.spyOn(speakerRepo, 'findOne').mockResolvedValue(existing());
      jest.spyOn(speakerRepo, 'save').mockImplementation((e) => Promise.resolve(e as never));

      await provider.updateWithInfo('s-1', { guid: 's-hijack' } as never);

      expect((speakerRepo.save as jest.Mock).mock.calls[0][0].guid).toBe('s-1');
    });
  });

  describe('.copySpeakersIntoSeason()', () => {
    it('rejects a season that does not exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue(null);

      await expect(provider.copySpeakersIntoSeason('missing', ['s-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('rejects when none of the requested speakers exist', async () => {
      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([]);

      await expect(provider.copySpeakersIntoSeason('season-2', ['s-1'])).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('strips identity from the speaker and their images', async () => {
      const source = {
        guid: 's-1',
        created: new Date(),
        updated: new Date(),
        firstName: 'A',
        images: [{ guid: 'i-1', created: new Date(), updated: new Date() }]
      } as unknown as Speaker;

      jest.spyOn(seasonService, 'findOne').mockResolvedValue({ guid: 'season-2' } as never);
      jest.spyOn(speakerRepo, 'find').mockResolvedValue([source]);
      jest
        .spyOn(speakerRepo, 'create')
        .mockImplementation((e) => ({ ...(e as object), save: jest.fn().mockResolvedValue(e) }) as never);

      await provider.copySpeakersIntoSeason('season-2', ['s-1']);

      const passed = (speakerRepo.create as jest.Mock).mock.calls[0][0];
      expect(passed.guid).toBeUndefined();
      expect(passed.season).toEqual({ guid: 'season-2' });
      // The image is a separate row; carrying its guid would move it off the original speaker.
      expect(passed.images[0].guid).toBeUndefined();
      expect(passed.firstName).toBe('A');
    });
  });

  describe('.deleteEntities()', () => {
    const withManager = (manager: Record<string, jest.Mock>) => {
      (speakerRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(manager));
    };

    it('accepts a comma-separated string and an array alike', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue({ affected: 2 })
      };
      withManager(manager);

      await provider.deleteEntities('s-1,s-2');
      expect(manager.delete).toHaveBeenLastCalledWith(Speaker, ['s-1', 's-2']);

      await provider.deleteEntities(['s-3']);
      expect(manager.delete).toHaveBeenLastCalledWith(Speaker, ['s-3']);
    });

    it('removes the images belonging to the speakers being deleted', async () => {
      const image = { guid: 'i-1' } as Asset;
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 's-1', images: [image] }]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['s-1']);

      // Through AssetsService, which deletes the rows by guid and their files after commit (#2205).
      expect(assetService.deleteAssets).toHaveBeenCalledWith(manager, [image]);
      expect(assetService.deleteAssetFiles).toHaveBeenCalledWith([image]);
    });

    it('does not attempt an image delete when there are none', async () => {
      const manager = {
        find: jest.fn().mockResolvedValue([{ guid: 's-1', images: [] }]),
        delete: jest.fn().mockResolvedValue({ affected: 1 })
      };
      withManager(manager);

      await provider.deleteEntities(['s-1']);

      // A delete with an empty list would remove every asset in the table on some drivers.
      expect(manager.delete).toHaveBeenCalledTimes(1);
      expect(manager.delete).toHaveBeenCalledWith(Speaker, ['s-1']);
    });
  });
});

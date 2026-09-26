import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';

import { ensureDirectoryExists, fileExists, writeFileToDisk } from '@tamu-gisc/common/node/fs';

import { Asset } from '../entities/all.entity';
import { AssetsService } from './assets.service';

jest.mock('@tamu-gisc/common/node/fs', () => ({
  ensureDirectoryExists: jest.fn(),
  fileExists: jest.fn(),
  writeFileToDisk: jest.fn()
}));

describe('AssetsService', () => {
  let service: AssetsService;
  let assetRepo: Repository<Asset>;

  const APP_DATA = '/srv/gisday-assets';
  const original = { ...process.env };

  beforeEach(async () => {
    process.env.APP_DATA = APP_DATA;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: getRepositoryToken(Asset), useValue: { findOne: jest.fn(), create: jest.fn() } }
      ]
    }).compile();

    service = module.get<AssetsService>(AssetsService);
    assetRepo = module.get(getRepositoryToken(Asset));
  });

  afterEach(() => {
    process.env = { ...original };
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.findOne()', () => {
    it('returns the asset when the row and the file on disk both exist', async () => {
      const asset = { guid: 'a-1', path: 'images/places/logo.png' } as Asset;
      jest.spyOn(assetRepo, 'findOne').mockResolvedValue(asset);
      (fileExists as jest.Mock).mockResolvedValue(true);

      await expect(service.findOne('a-1')).resolves.toBe(asset);
      expect(assetRepo.findOne).toHaveBeenCalledWith({ where: { guid: 'a-1' } });
      expect(fileExists).toHaveBeenCalledWith(`${APP_DATA}/images/places/logo.png`);
    });

    it('throws NotFound when no row has that guid', async () => {
      jest.spyOn(assetRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
      // Nothing should touch the filesystem for a guid that is not in the database.
      expect(fileExists).not.toHaveBeenCalled();
    });

    /**
     * The row and the file can disagree: a record can survive a deploy that did not carry the
     * volume, or a manual deletion. Answering 404 rather than handing back a row whose file is
     * gone is what keeps the caller from serving a broken image.
     */
    it('throws NotFound when the row exists but the file does not', async () => {
      jest.spyOn(assetRepo, 'findOne').mockResolvedValue({ guid: 'a-1', path: 'images/gone.png' } as Asset);
      (fileExists as jest.Mock).mockResolvedValue(false);

      await expect(service.findOne('a-1')).rejects.toThrow(NotFoundException);
    });

    it('ensures the assets directory exists before checking for the file', async () => {
      jest.spyOn(assetRepo, 'findOne').mockResolvedValue({ guid: 'a-1', path: 'x.png' } as Asset);
      (fileExists as jest.Mock).mockResolvedValue(true);

      await service.findOne('a-1');

      expect(ensureDirectoryExists).toHaveBeenCalledWith(APP_DATA);
    });
  });

  describe('.saveAsset()', () => {
    const file = { originalname: 'logo.png' } as Express.Multer.File;

    it('writes under the resource path and records the relative path on the row', async () => {
      (writeFileToDisk as jest.Mock).mockResolvedValue('logo.png');
      const save = jest.fn().mockResolvedValue({ guid: 'a-new' });
      jest.spyOn(assetRepo, 'create').mockReturnValue({ save } as never);

      await expect(service.saveAsset('images/places', file, 'place-logo')).resolves.toEqual({
        guid: 'a-new'
      });

      expect(writeFileToDisk).toHaveBeenCalledWith(
        `${APP_DATA}/images/places`,
        file,
        expect.objectContaining({ truncateFileNameLength: 50 })
      );
      // The stored path is relative to APP_DATA, not absolute -- `findOne` re-joins them, so
      // storing an absolute path here would double the prefix on read.
      expect(assetRepo.create).toHaveBeenCalledWith({
        name: 'logo.png',
        path: 'images/places/logo.png',
        type: 'place-logo'
      });
    });

    it('lets caller options override the defaults', async () => {
      (writeFileToDisk as jest.Mock).mockResolvedValue('logo.png');
      jest.spyOn(assetRepo, 'create').mockReturnValue({ save: jest.fn() } as never);

      await service.saveAsset('images/places', file, 'place-logo', { truncateFileNameLength: 10 });

      expect(writeFileToDisk).toHaveBeenCalledWith(
        expect.any(String),
        file,
        expect.objectContaining({ truncateFileNameLength: 10 })
      );
    });

    it('does not create a row when the write fails', async () => {
      (writeFileToDisk as jest.Mock).mockRejectedValue(new Error('disk full'));

      await expect(service.saveAsset('images/places', file, 'place-logo')).rejects.toThrow(
        'Could not save asset.'
      );
      // A row pointing at a file that was never written would fail every later `findOne`.
      expect(assetRepo.create).not.toHaveBeenCalled();
    });
  });
});

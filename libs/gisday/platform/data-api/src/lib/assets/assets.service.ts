import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
  WriteFileToDiskOptions,
  deleteFileFromDisk,
  ensureDirectoryExists,
  fileExists,
  writeFileToDisk
} from '@tamu-gisc/common/node/fs';

import { Asset } from '../entities/all.entity';

@Injectable()
export class AssetsService {
  private _assetsDir = `${process.env.APP_DATA}`;

  constructor(@InjectRepository(Asset) private readonly ar: Repository<Asset>) {}

  public async findOne(guid: string) {
    const asset = await this.ar.findOne({
      where: {
        guid: guid
      }
    });

    if (asset) {
      await ensureDirectoryExists(this._assetsDir);
      const filePath = `${this._assetsDir}/${asset.path}`;

      const exists = await fileExists(filePath);

      if (!exists) {
        Logger.error(`File ${filePath} does not exist.`, 'AssetsService');
        throw new NotFoundException();
      }

      return asset;
    } else {
      throw new NotFoundException();
    }
  }

  public async saveAsset(
    resourcePath: string,
    file: Express.Multer.File,
    resourceType: string,
    options?: WriteFileToDiskOptions
  ) {
    const path = `${this._assetsDir}/${resourcePath}`;

    const defaultOptions: WriteFileToDiskOptions = {
      truncateFileNameLength: 50
    };

    const inputOptions = options ? options : {};
    let savedFile;

    try {
      savedFile = await writeFileToDisk(path, file, { ...defaultOptions, ...inputOptions });
    } catch (err) {
      Logger.error(err.message, 'AssetsService');
      throw new Error('Could not save asset.', { cause: err });
    }

    const asset = this.ar.create({
      name: savedFile,
      path: `${resourcePath}/${savedFile}`,
      type: resourceType
    });

    return asset.save();
  }

  /**
   * Deletes asset rows inside the caller's transaction, so they go with the entity that owned them or not at all.
   *
   * By guid, never by the rows themselves: handed whole rows, TypeORM matches on every column, timestamps included, and
   * on SQL Server that matched no row. The owner's delete then failed on the asset's foreign key, so a sponsor with a
   * logo could not be deleted (#2205).
   */
  public async deleteAssets(manager: EntityManager, assets: Array<Asset>): Promise<void> {
    if (assets.length === 0) {
      return;
    }

    await manager.delete(
      Asset,
      assets.map((asset) => asset.guid)
    );
  }

  /**
   * Removes the files behind assets whose rows have been deleted. Called once the delete has committed, so a file that
   * cannot be removed is logged rather than thrown: the caller has already succeeded, and the rest are still removed.
   */
  public async deleteAssetFiles(assets: Array<Asset>): Promise<void> {
    for (const asset of assets) {
      if (!asset.path) {
        continue;
      }

      const filePath = `${this._assetsDir}/${asset.path}`;

      try {
        await deleteFileFromDisk(filePath);
      } catch (err) {
        Logger.error(`Could not delete ${filePath}: ${err.message}`, 'AssetsService');
      }
    }
  }
}

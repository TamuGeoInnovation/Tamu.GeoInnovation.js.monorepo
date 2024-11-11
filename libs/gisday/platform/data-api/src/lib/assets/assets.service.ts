import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WriteFileToDiskOptions, ensureDirectoryExists, fileExists, writeFileToDisk } from '@tamu-gisc/common/node/fs';

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
      throw new Error('Could not save asset.');
    }

    const asset = this.ar.create({
      name: savedFile,
      path: `${resourcePath}/${savedFile}`,
      type: resourceType
    });

    return asset.save();
  }
}

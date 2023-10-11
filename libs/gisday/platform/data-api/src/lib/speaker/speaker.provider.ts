import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  InternalServerErrorException,
  StreamableFile,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'node:fs';
import { from } from 'rxjs';
import { DeepPartial, Repository } from 'typeorm';

import * as mime from 'mime-types';

import { ensureDirectoryExists, fileExists, writeFileToDisk } from '@tamu-gisc/common/node/fs';
import { Speaker, SpeakerImage, University, EntityRelationsLUT, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  public presenterImageDir = `${process.env.APP_DATA}/images/presenters`;

  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(SpeakerImage) public speakerImageRepo: Repository<SpeakerImage>,
    @InjectRepository(University) public uniRepo: Repository<University>
  ) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    return from(
      this.speakerRepo.findOne({
        where: {
          guid: guid
        },
        relations: ['image']
      })
    );
  }

  /**
   * Returns a streamable file photo for the provided speaker guid.
   */
  public async getSpeakerPhoto(speakerGuid: string) {
    const speakerInfo = await this.speakerRepo.findOne({
      where: {
        guid: speakerGuid
      },
      relations: ['image']
    });

    if (speakerInfo.image && speakerInfo.image.path) {
      await ensureDirectoryExists(this.presenterImageDir);
      const filePath = `${this.presenterImageDir}/${speakerInfo.image.path}`;

      const exists = await fileExists(filePath);

      if (!exists) {
        throw new NotFoundException();
      }

      const file = createReadStream(filePath);
      return new StreamableFile(file, {
        type: mime.lookup(filePath)
      });
    } else {
      throw new NotFoundException();
    }
  }

  public async updateWithInfo(guid: string, incoming: DeepPartial<Speaker>, file?) {
    delete incoming.guid;

    const existing = await this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('speaker')
    });

    if (existing) {
      let speakerImage;

      if (file != null || file != undefined) {
        try {
          const savedFileName = await this._saveImage(file, guid);

          speakerImage = this.speakerImageRepo.create({
            path: savedFileName
          });
        } catch (err) {
          Logger.error(err.message, 'SpeakerProvider');
          throw new InternalServerErrorException('Could not save speaker image');
        }
      }

      return this.speakerRepo.save({
        ...existing,
        ...incoming,
        image: speakerImage
      });
    } else {
      throw new NotFoundException();
    }
  }

  public async insertWithInfo(speaker: DeepPartial<Speaker>, file?) {
    const speakerEnt = this.speakerRepo.create({
      ...speaker
    });

    if (speakerEnt) {
      const savedEntity = await speakerEnt.save();

      if (file != null || file != undefined) {
        try {
          const savedFileName = await this._saveImage(file, savedEntity.guid);

          const speakerImage = this.speakerImageRepo.create({
            path: savedFileName
          });

          savedEntity.image = speakerImage;

          return savedEntity.save();
        } catch (err) {
          Logger.error(err.message, 'SpeakerProvider');
          throw new InternalServerErrorException('Could not save speaker image');
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create speaker');
    }
  }

  private async _saveImage(file, guid: string) {
    return await writeFileToDisk(this.presenterImageDir, file, { prefix: `${guid}-`, truncateFileNameLength: 50 });
  }
}

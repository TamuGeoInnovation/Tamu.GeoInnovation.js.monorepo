import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  InternalServerErrorException,
  StreamableFile
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { writeFile, readdir, mkdir, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { distinct, filter, from, mergeMap, toArray } from 'rxjs';
import { DeepPartial, Repository } from 'typeorm';

import { Request } from 'express';
import * as mime from 'mime-types';

import { Speaker, SpeakerImage, University, EntityRelationsLUT, Event } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
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

  public async getPresenters() {
    const speakers = from(
      this.eventRepo.find({
        relations: ['speakers', 'speakers.university']
      })
    ).pipe(
      mergeMap((events) => events),
      filter((event) => event.speakers != null),
      mergeMap((event) => event.speakers),
      distinct(({ guid }) => guid),
      filter((speaker) => speaker.isActive),
      toArray()
    );

    return speakers;
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
      await this.ensureDirectoryExists(process.env.SPEAKER_IMAGE_PATH);
      const filePath = `${process.env.SPEAKER_IMAGE_PATH}/${speakerInfo.image.path}`;

      const exists = await this._fileExists(filePath);

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
        const savedFileName = await this._writeImageToDisk(file, guid);
        speakerImage = this.speakerImageRepo.create({
          path: savedFileName
        });
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
        const savedFileName = await this._writeImageToDisk(file, savedEntity.guid);

        const speakerImage = this.speakerImageRepo.create({
          path: savedFileName
        });

        savedEntity.image = speakerImage;

        return savedEntity.save();
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create speaker');
    }
  }

  public async insertPhoto(speakerGuid: string, req: Request, file) {
    const speaker = await this.speakerRepo.findOne({
      where: {
        guid: speakerGuid
      }
    });

    if (speaker) {
      const _photo: Partial<SpeakerImage> = {
        ...req.body,
        speaker: speaker,
        blob: file.buffer
      };

      const photo = await this.speakerImageRepo.create(_photo);
      const speakerInfo = await this.speakerImageRepo.save(photo);
      speaker.image = speakerInfo;

      return speaker.save();
    } else {
      throw new UnprocessableEntityException(null, `Speaker could not be found`);
    }
  }

  /**
   * Checks if a file exists at the provided path.
   *
   * `stat` will throw an error if the file does not exist, so we catch it and return false.
   */
  private async _fileExists(fileName: string) {
    try {
      await stat(fileName);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async _writeImageToDisk(file: { buffer: Buffer; originalname: string }, prefix: string) {
    try {
      await this.ensureDirectoryExists(process.env.SPEAKER_IMAGE_PATH);

      await writeFile(`${process.env.SPEAKER_IMAGE_PATH}/${prefix}-${file.originalname}`, file.buffer);

      return `${prefix}-${file.originalname}`;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  private async ensureDirectoryExists(path: string) {
    // With fs promises, check if the directory exists, if not, create it
    try {
      return await readdir(path);
    } catch (error) {
      // Directory doesn't exist, create it
      return await mkdir(path, { recursive: true });
    }
  }
}

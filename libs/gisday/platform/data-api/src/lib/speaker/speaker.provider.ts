import {
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { Speaker, EntityRelationsLUT } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class SpeakerProvider extends BaseProvider<Speaker> {
  private _resourcePath = `images/speakers/`;

  constructor(
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    private readonly assetService: AssetsService
  ) {
    super(speakerRepo);
  }

  public async getPresenter(guid: string) {
    return this.speakerRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['organization', 'university', 'images']
    });
  }

  public async getPresenters() {
    return this.speakerRepo.find({
      relations: ['organization', 'university', 'images'],
      order: {
        lastName: 'ASC'
      }
    });
  }

  public async getOrganizationCommittee() {
    return this.speakerRepo.find({
      where: {
        isOrganizer: true
      },
      relations: ['organization', 'university', 'images'],
      order: {
        lastName: 'ASC'
      }
    });
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
          speakerImage = await this._saveImage(file, guid);
        } catch (err) {
          Logger.error(err.message, 'SpeakerProvider');
          throw new InternalServerErrorException('Could not save speaker image');
        }
      }

      return this.speakerRepo.save({
        ...existing,
        ...incoming,
        isOrganizer: (incoming as any).isOrganizer === 'true', // form data coerces boolean to string
        images: [speakerImage]
      });
    } else {
      throw new NotFoundException();
    }
  }

  public async insertWithInfo(speaker: DeepPartial<Speaker>, file?) {
    const speakerEnt = this.speakerRepo.create({
      ...speaker,
      isOrganizer: (speaker as any).isOrganizer === 'true' // form data coerces boolean to string
    });

    if (speakerEnt) {
      const savedEntity = await speakerEnt.save();

      if (file != null || file != undefined) {
        try {
          const speakerImage = await this._saveImage(file, savedEntity.guid);

          savedEntity.images = [speakerImage];

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
    return this.assetService.saveAsset(this._resourcePath, file, 'speaker-image', {
      prefix: `${guid}-`
    });
  }
}

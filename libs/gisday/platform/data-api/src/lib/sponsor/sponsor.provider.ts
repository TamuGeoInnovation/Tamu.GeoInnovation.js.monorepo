import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Sponsor } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';
@Injectable()
export class SponsorProvider extends BaseProvider<Sponsor> {
  private _resourcePath = `images/sponsors`;

  constructor(
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(sponsorRepo);
  }

  public async getSponsorsForSeason(seasonGuid: string) {
    try {
      const season = await this.seasonService.findOne({
        where: {
          guid: seasonGuid
        }
      });

      if (!season) {
        throw new UnprocessableEntityException('Season does not exist.');
      }

      return this.find({
        where: {
          season: season
        },
        relations: ['season', 'logos'],
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      Logger.error(err.message, 'SponsorProvider');
      throw new InternalServerErrorException('Could not find sponsors for season.');
    }
  }

  public async copyEntitiesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    const season = await this.seasonService.findOne({
      where: {
        guid: seasonGuid
      }
    });

    if (!season) {
      throw new UnprocessableEntityException('Season does not exist.');
    }

    const entities = await this.find({
      where: {
        guid: In(existingEntityGuids)
      },
      relations: ['logos']
    });

    if (!entities || entities.length === 0) {
      throw new UnprocessableEntityException('Could not find sponsors.');
    }

    const newEntities = entities.map((entity) => {
      delete entity.guid;
      delete entity.created;
      delete entity.updated;

      if (entity.logos?.length > 0) {
        entity.logos = entity.logos.map((logo) => {
          delete logo.guid;
          delete logo.created;
          delete logo.updated;

          return logo;
        });
      }

      const newEntity = this.sponsorRepo.create({
        ...entity,
        season: season
      });

      return newEntity.save();
    });

    try {
      return Promise.all(newEntities);
    } catch (err) {
      Logger.error(err.message, 'SponsorProvider');
      throw new InternalServerErrorException('Could not copy sponsors into season.');
    }
  }

  public async createSponsor(sponsor: Partial<Sponsor>, file?: Express.Multer.File) {
    const sponsorEnt = this.sponsorRepo.create({
      ...sponsor
    });

    if (sponsorEnt) {
      const savedEntity = await sponsorEnt.save();

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          savedEntity.logos = [savedLogo];

          return savedEntity.save();
        } catch (err) {
          Logger.error(err.message, 'SponsorProvider');
          throw new InternalServerErrorException('Could not save sponsor logo.');
        }
      } else {
        return savedEntity;
      }
    } else {
      throw new UnprocessableEntityException(null, 'Could not create sponsor.');
    }
  }

  public async updateSponsor(guid: string, incoming: Partial<Sponsor>, file?: Express.Multer.File) {
    delete incoming.guid;

    const existing = await this.sponsorRepo.findOne({
      where: {
        guid: guid
      },
      relations: ['logos']
    });

    if (existing) {
      let logoImage;

      if (file != null || file != undefined) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          Logger.error(err.message, 'SponsorProvider');
          throw new InternalServerErrorException('Could not save sponsor logo.');
        }
      }

      const toSave = {
        ...existing,
        ...incoming,
        logos: [logoImage]
      };

      if (!logoImage) {
        delete toSave.logos;
      }

      return this.sponsorRepo.save(toSave);
    } else {
      throw new NotFoundException();
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'sponsor-logo');
  }
}

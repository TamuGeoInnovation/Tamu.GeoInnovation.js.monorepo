import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Place, PlaceLink } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { AssetsService } from '../assets/assets.service';
import { SeasonService } from '../season/season.service';

@Injectable()
export class PlaceService extends BaseProvider<Place> {
  private _resourcePath = `images/places`;

  constructor(
    @InjectRepository(Place) private pRepo: Repository<Place>,
    @InjectRepository(PlaceLink) private plRepo: Repository<PlaceLink>,
    private readonly assetService: AssetsService,
    private readonly seasonService: SeasonService
  ) {
    super(pRepo);
  }

  public async getPlacesForSeason(seasonGuid: string) {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .leftJoin('place.season', 'season')
        .where('season.guid = :seasonGuid', { seasonGuid })
        .orderBy('place.name', 'ASC')
        .addOrderBy('links.label', 'ASC')
        .getMany();
    } catch (err) {
      Logger.error(`Error retrieving places for season, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async getPlacesForActiveSeason() {
    try {
      const season = await this.seasonService.findOneActive();

      if (!season) {
        throw new UnprocessableEntityException('No active season found.');
      }

      return this.getPlacesForSeason(season.guid);
    } catch (err) {
      Logger.error(`Error retrieving places for active season, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public getEntity(guid: string) {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .orderBy('links.label', 'ASC')
        .where('place.guid = :guid', { guid })
        .getOne();
    } catch (err) {
      Logger.error(`Error retrieving place, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public getEntities() {
    try {
      return this.pRepo
        .createQueryBuilder('place')
        .leftJoinAndSelect('place.links', 'links')
        .leftJoinAndSelect('place.logos', 'logos')
        .orderBy('place.name', 'ASC')
        .addOrderBy('links.label', 'ASC')
        .getMany();
    } catch (err) {
      Logger.error(`Error retrieving places, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async copyPlacesIntoSeason(seasonGuid: string, existingEntityGuids?: Array<string>) {
    try {
      const season = await this.seasonService.findOne(seasonGuid);

      if (!season) {
        throw new UnprocessableEntityException('Season does not exist');
      }

      const entities = await this.pRepo.find({
        where: {
          guid: In(existingEntityGuids)
        },
        relations: ['links', 'logos']
      });

      if (!entities || entities.length === 0) {
        throw new UnprocessableEntityException('No entities found to copy');
      }

      const copied = entities.map((entity) => {
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

        if (entity.links?.length > 0) {
          entity.links.map((link) => {
            delete link.guid;
            delete link.created;
            delete link.updated;

            return link;
          });
        }

        return this.pRepo.create({ ...entity, season }).save();
      });

      return Promise.all(copied);
    } catch (err) {
      Logger.error(`Error copying places into season, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async createPlace(place: Partial<Place>, file?: Express.Multer.File) {
    try {
      let links: Array<PlaceLink> = [];

      if (place.links && place.links.length > 0) {
        // Because the payload is formData, we need to parse the stringified JSON
        const parsed: Array<Partial<PlaceLink>> = JSON.parse(place.links as unknown as string);

        links = parsed.map((link) => {
          delete link.guid;

          return this.plRepo.create({ ...link });
        });
      }

      const created = this.pRepo.create({ ...place, links });

      const saved = await this.pRepo.save(created);

      if (file != null || file != undefined) {
        try {
          const savedLogo = await this._saveImage(file);

          saved.logos = [savedLogo];

          return saved.save();
        } catch (err) {
          Logger.error(err.message, 'PlaceService');
          throw new InternalServerErrorException('Could not save place logo.');
        }
      } else {
        return saved;
      }
    } catch (err) {
      Logger.error(`Error creating place, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async updatePlace(guid: string, place: Partial<Place>, file?: Express.Multer.File) {
    delete place.guid;

    try {
      const existing = await this.pRepo.findOne({
        where: {
          guid
        },
        relations: ['logos']
      });

      if (!existing) {
        throw new NotFoundException();
      }

      let links: Array<Partial<PlaceLink>> = [];

      if (place.links && place.links.length > 0) {
        // Because the payload is formData, we need to parse the stringified JSON
        const parsed: Array<Partial<PlaceLink>> = JSON.parse(place.links as unknown as string);

        links = parsed.map((newOrOld) => {
          if (newOrOld.guid) {
            return newOrOld;
          } else {
            delete newOrOld.guid;

            return this.plRepo.create({ ...newOrOld });
          }
        });
      }

      let logoImage;

      if (file != null || file != undefined) {
        try {
          logoImage = await this._saveImage(file);
        } catch (err) {
          Logger.error(err.message, 'PlaceService');
          throw new InternalServerErrorException('Could not save place logo.');
        }
      }

      const toSave = {
        ...existing,
        ...place,
        links: links,
        logos: [logoImage]
      };

      if (logoImage === undefined) {
        delete toSave.logos;
      }

      const updated = await this.pRepo.save(toSave);

      return updated;
    } catch (err) {
      Logger.error(`Error updating place, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  private async _saveImage(file) {
    return this.assetService.saveAsset(this._resourcePath, file, 'place-logo');
  }
}

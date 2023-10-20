import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Place, PlaceLink } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class PlaceService extends BaseProvider<Place> {
  constructor(
    @InjectRepository(Place) private pRepo: Repository<Place>,
    @InjectRepository(PlaceLink) private plRepo: Repository<PlaceLink>
  ) {
    super(pRepo);
  }

  public getEntities() {
    try {
      return this.pRepo.find({
        order: {
          guid: 'ASC'
        },
        relations: ['links']
      });
    } catch (err) {
      Logger.error(`Error retrieving places, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async createPlace(place: Partial<Place>) {
    try {
      let links: Array<PlaceLink> = [];

      if (place.links && place.links.length > 0) {
        links = place.links.map((link) => {
          delete link.guid;

          return this.plRepo.create({ ...link });
        });
      }

      const created = this.pRepo.create({ ...place, links });

      const saved = await this.pRepo.save(created);

      return saved;
    } catch (err) {
      Logger.error(`Error creating place, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }

  public async updatePlace(guid: string, place: Partial<Place>) {
    try {
      const existing = await this.pRepo.findOne({
        where: {
          guid
        }
      });

      if (!existing) {
        throw new NotFoundException();
      }

      let links: Array<PlaceLink> = [];

      if (place.links && place.links.length > 0) {
        links = place.links.map((newOrOld) => {
          if (newOrOld.guid) {
            return newOrOld;
          } else {
            delete newOrOld.guid;

            return this.plRepo.create({ ...newOrOld });
          }
        });
      }

      const updated = await this.pRepo.save({
        ...existing,
        ...place,
        links: links
      });

      return updated;
    } catch (err) {
      Logger.error(`Error updating place, ${err.message}`, 'PlaceService');
      throw new InternalServerErrorException(err);
    }
  }
}

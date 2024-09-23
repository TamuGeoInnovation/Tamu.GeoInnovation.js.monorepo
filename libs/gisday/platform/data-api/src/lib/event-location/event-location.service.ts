import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { EventLocation, Season } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class EventLocationService extends BaseProvider<EventLocation> {
  constructor(
    @InjectRepository(EventLocation) private esRepo: Repository<EventLocation>,
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>
  ) {
    super(esRepo);
  }

  public getEventLocationsForSeason(seasonGuid: string) {
    try {
      const season = this.seasonRepo.findOne({ where: { guid: seasonGuid } });

      if (!season) {
        throw new UnprocessableEntityException('Season not found');
      }

      const q = this.esRepo
        .createQueryBuilder('event-location')
        .leftJoinAndSelect('event-location.place', 'organization')
        .leftJoinAndSelect('event-location.season', 'season')
        .where('season.guid = :guid', { guid: seasonGuid });

      const qq = this.applyDefaultOrdering(q);

      return qq.getMany();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public getEntities() {
    try {
      const q = this.esRepo.createQueryBuilder('event-location').leftJoinAndSelect('event-location.place', 'organization');

      const qq = this.applyDefaultOrdering(q);

      return qq.getMany();
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async copyEventLocationsIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    try {
      const season = await this.seasonRepo.findOne({ where: { guid: seasonGuid } });

      if (!season) {
        throw new UnprocessableEntityException('Season not found');
      }

      const existingEntities = await this.esRepo.findByIds(existingEntityGuids);

      if (!existingEntities || existingEntities.length === 0) {
        throw new UnprocessableEntityException('No existing entities found');
      }

      const newEntities = existingEntities.map((entity) => {
        delete entity.guid;
        delete entity.season;
        delete entity.place;
        delete entity.events;

        return this.esRepo.create({
          ...entity,
          season: season
        });
      });

      return this.esRepo.save(newEntities);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  private applyDefaultOrdering(query: SelectQueryBuilder<EventLocation>) {
    return query.orderBy('organization.name', 'ASC').addOrderBy('event-location.building', 'ASC');
  }
}

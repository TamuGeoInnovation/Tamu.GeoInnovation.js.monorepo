import { Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository, SelectQueryBuilder } from 'typeorm';

import { EventLocation } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';

@Injectable()
export class EventLocationService extends BaseProvider<EventLocation> {
  constructor(
    @InjectRepository(EventLocation) private esRepo: Repository<EventLocation>,
    private readonly seasonService: SeasonService
  ) {
    super(esRepo);
  }

  public async getEventLocationsForSeason(seasonGuid: string) {
    try {
      // `await`, and the method is `async` to allow it. Without both, `season` held a pending
      // Promise -- always truthy -- so the guard below never fired and a request for a season
      // that does not exist ran the query anyway and answered an empty list instead of 422.
      const season = await this.seasonService.findOne({ where: { guid: seasonGuid } });

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
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  public async getEventLocationsForActiveSeason() {
    try {
      const season = await this.seasonService.findOneActive();

      if (!season) {
        throw new UnprocessableEntityException('No active season found');
      }

      return this.getEventLocationsForSeason(season.guid);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  public getEntities() {
    try {
      const q = this.esRepo.createQueryBuilder('event-location').leftJoinAndSelect('event-location.place', 'organization');

      const qq = this.applyDefaultOrdering(q);

      return qq.getMany();
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  public async copyEventLocationsIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    try {
      const season = await this.seasonService.findOne({ where: { guid: seasonGuid } });

      if (!season) {
        throw new UnprocessableEntityException('Season not found');
      }

      const existingEntities = await this.esRepo.find({
        where: {
          guid: In(existingEntityGuids)
        }
      });

      if (!existingEntities || existingEntities.length === 0) {
        throw new UnprocessableEntityException('No existing entities found');
      }

      const newEntities = existingEntities.map((entity) => {
        delete entity.guid;
        delete entity.season;
        delete entity.place;
        delete entity.events;
        delete entity.created;
        delete entity.updated;

        return this.esRepo.create({
          ...entity,
          season: season
        });
      });

      return this.esRepo.save(newEntities);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  private applyDefaultOrdering(query: SelectQueryBuilder<EventLocation>) {
    return query.orderBy('organization.name', 'ASC').addOrderBy('event-location.building', 'ASC');
  }

  public override deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    try {
      return this.esRepo.manager.transaction(async (transactionalEntityManager) => {
        const locationEvents = await transactionalEntityManager.find(EventLocation, {
          where: {
            guid: In(guids)
          },
          relations: { events: true }
        });

        const events = locationEvents.map((location) => location.events).flat();

        // Remove location from all events
        events.forEach((event) => {
          event.location = null;
        });

        await transactionalEntityManager.save(events);

        return transactionalEntityManager.delete(EventLocation, guids);
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities'), () => Logger.error(err.message, 'EventLocationService.deleteEntities'));
    }
  }
}

import { Injectable, InternalServerErrorException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { EventBroadcast } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { SeasonService } from '../season/season.service';

@Injectable()
export class EventBroadcastService extends BaseProvider<EventBroadcast> {
  constructor(@InjectRepository(EventBroadcast) private eb: Repository<EventBroadcast>, private readonly ss: SeasonService) {
    super(eb);
  }

  public getEntities() {
    try {
      return this.eb.find({
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public getBroadcastsForSeason(seasonGuid: string) {
    try {
      return this.eb.find({
        where: {
          season: seasonGuid
        },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async getBroadcastsForActiveSeason() {
    const season = await this.ss.findOneActive();

    try {
      return this.eb.find({
        where: {
          season: season.guid
        },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  public async copyBroadcastsIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    try {
      const existingEntities = await this.eb.find({
        where: {
          guid: In(existingEntityGuids)
        }
      });

      const newEntities = existingEntities.map((entity) => {
        delete entity.guid;
        delete entity.season;
        delete entity.created;
        delete entity.updated;

        return this.eb
          .create({
            ...entity,
            season: {
              guid: seasonGuid
            }
          })
          .save();
      });

      try {
        return Promise.all(newEntities);
      } catch (err) {
        throw new InternalServerErrorException(err);
      }
    } catch (err) {
      throw new UnprocessableEntityException(err);
    }
  }
}

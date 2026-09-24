import { HttpException, Injectable, InternalServerErrorException, Logger, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

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
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(err);
    }
  }

  public getBroadcastsForSeason(seasonGuid: string) {
    try {
      return this.eb.find({
        where: {
          season: { guid: seasonGuid }
        },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(err);
    }
  }

  public async getBroadcastsForActiveSeason() {
    const season = await this.ss.findOneActive();

    try {
      return this.eb.find({
        where: {
          season: { guid: season.guid }
        },
        order: {
          name: 'ASC'
        }
      });
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

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
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

        throw new InternalServerErrorException(err);
      }
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      throw new UnprocessableEntityException(err);
    }
  }

  public override deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    try {
      return this.eb.manager.transaction(async (transactionalEntityManager) => {
        const broadcastEvents = await transactionalEntityManager.find(EventBroadcast, {
          where: {
            guid: In(guids)
          },
          relations: ['events']
        });

        const events = broadcastEvents.map((broadcast) => broadcast.events).flat();

        // Remove broadcast from all events
        events.forEach((event) => {
          event.broadcast = null;
        });

        await transactionalEntityManager.save(events);

        return transactionalEntityManager.delete(EventBroadcast, guids);
      });
    } catch (err) {
      // An HttpException carries a deliberate status. Re-wrapping it below turned intended
      // 404s and 422s into 500s, so the caller could not tell "not found" from "server broke".
      if (err instanceof HttpException) {
        throw err;
      }

      Logger.error(err.message, 'EventBroadcastService.deleteEntities');
      throw new InternalServerErrorException('Could not delete entities');
    }
  }
}

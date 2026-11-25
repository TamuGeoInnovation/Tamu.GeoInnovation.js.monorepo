import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, In, Repository } from 'typeorm';

import { EventBroadcast } from '../entities/all.entity';
import { byName } from '@tamu-gisc/gisday/common';

import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider } from '../_base/season-scoped-provider';

@Injectable()
export class EventBroadcastService extends SeasonScopedProvider<EventBroadcast> {
  protected get seasons() {
    return this.ss;
  }

  protected readonly recordsName = 'broadcasts';

  protected forSeason(seasonGuid: string) {
    return this.getBroadcastsForSeason(seasonGuid);
  }

  constructor(
    @InjectRepository(EventBroadcast) private eb: Repository<EventBroadcast>,
    private readonly ss: SeasonService
  ) {
    super(eb);
  }

  /**
   * The sessions that use a broadcast (#3032), for its admin page: each with its day and place, so the page can order them
   * and list only its site's. Hidden sessions too, which is why the route is for admins.
   */
  public async getSessions(guid: string) {
    const broadcast = await this.eb.findOne({
      where: { guid },
      relations: { events: { day: true, location: { place: true } } }
    });

    if (!broadcast) {
      throw new NotFoundException('Broadcast not found.');
    }

    return broadcast.events ?? [];
  }

  /**
   * Every read of a list of broadcasts is in natural order by name (#3047): case ignored and numbers as numbers, which
   * the database's ORDER BY cannot do ("Zoom 10" before "Zoom 2"). Sorted here, once, so Admin > Broadcasts and every
   * Broadcast drop-down (an event's, which reads the active season's) agree.
   *
   * Each with its place (#3048), by which each site lists only its own organizations' broadcasts.
   */
  public getEntities() {
    try {
      return this.eb
        .find({
          relations: { place: true },
          order: {
            name: 'ASC'
          }
        })
        .then(byName);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  public getBroadcastsForSeason(seasonGuid: string) {
    try {
      return this.eb
        .find({
          relations: { place: true },
          where: {
            season: { guid: seasonGuid }
          },
          order: {
            name: 'ASC'
          }
        })
        .then(byName);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException(err));
    }
  }

  public async getBroadcastsForActiveSeason() {
    return this.forActiveSeason();
  }

  public async copyBroadcastsIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.copyIntoSeason(seasonGuid, existingEntityGuids);
  }

  public override deleteEntities(oneOrMoreEntityGuids: Array<string> | string): Promise<DeleteResult> {
    const guids = typeof oneOrMoreEntityGuids === 'string' ? oneOrMoreEntityGuids.split(',') : oneOrMoreEntityGuids;

    try {
      return this.eb.manager.transaction(async (transactionalEntityManager) => {
        const broadcastEvents = await transactionalEntityManager.find(EventBroadcast, {
          where: {
            guid: In(guids)
          },
          relations: { events: true }
        });

        // `events` is loaded by this find's `relations`.
        const events = broadcastEvents.flatMap((broadcast) => broadcast.events!);

        // Remove broadcast from all events
        events.forEach((event) => {
          event.broadcast = null;
        });

        await transactionalEntityManager.save(events);

        return transactionalEntityManager.delete(EventBroadcast, guids);
      });
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not delete entities'), () =>
        Logger.error(err.message, 'EventBroadcastService.deleteEntities')
      );
    }
  }
}

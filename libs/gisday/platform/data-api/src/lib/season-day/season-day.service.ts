import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseProvider } from '../_base/base-provider';
import { SeasonDay } from '../entities/all.entity';
import { SimplifiedEvent } from '../event/dto/simplified-event.dto';

@Injectable()
export class SeasonDayService extends BaseProvider<SeasonDay> {
  constructor(@InjectRepository(SeasonDay) private seasonDayRepo: Repository<SeasonDay>) {
    super(seasonDayRepo);
  }

  public async getDayEvents(guid: string): Promise<Array<SimplifiedEvent>> {
    try {
      const day = await this.seasonDayRepo.findOne({
        where: {
          guid
        },
        relations: [
          'events',
          'events.tags',
          'events.speakers',
          'events.speakers.organization',
          'events.location',
          'events.location.place'
        ]
      });

      if (day) {
        const simplified = day.events.map((e) => {
          const eventTagGuids = e.tags?.map((t) => t.guid) || [];
          const eventOrgGuids = e.speakers.filter((s) => s.organization !== null).map((s) => s.organization.guid) || [];
          const placeGuids = e.location?.place?.guid ? [e.location.place.guid] : [];

          // Don't send the speakers, they're not needed. They're only needed to
          // get the participating organizations for an event.
          delete e.speakers;

          return {
            ...e,
            tags: eventTagGuids,
            affiliations: eventOrgGuids,
            organizations: placeGuids
          };
        });

        return simplified
          .filter((e) => e.active)
          .sort((a, b) => {
            return a.startTime > b.startTime ? 1 : -1;
          });
      } else {
        throw new NotFoundException();
      }
    } catch (err) {
      Logger.error(err.message, 'SeasonDayService');
      throw new InternalServerErrorException();
    }
  }
}

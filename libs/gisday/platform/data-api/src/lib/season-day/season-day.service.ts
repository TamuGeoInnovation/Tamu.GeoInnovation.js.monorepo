import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseProvider } from '../_base/base-provider';
import { SeasonDay } from '../entities/all.entity';
import { SimplifiedEvent } from '../event/dto/simplified-event.dto';
import { rethrowHttp } from '../_base/rethrow-http';

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
        relations: { events: { tags: true, speakers: { organization: true }, location: { place: true } } }
      });

      if (day) {
        const simplified = day.events.map((e) => {
          const eventTagGuids = e.tags?.map((t) => t.guid) || [];
          const eventOrgGuids = e.speakers.filter((s) => s.organization !== null).map((s) => s.organization.guid) || [];
          const placeGuids = e.location?.place?.guid ? [e.location.place.guid] : [];
          // Their names only, which the Presenters page shows already, so the Sessions list can be searched by them (#2944).
          const presenterNames = e.speakers
            .map((s) => [s.firstName, s.lastName].filter((part) => part?.trim()).join(' '))
            .filter((name) => name.length > 0);

          // Don't send the speakers themselves, only what is taken from them above: a speaker's email and account
          // are not for the public list.
          delete e.speakers;

          return {
            ...e,
            tags: eventTagGuids,
            affiliations: eventOrgGuids,
            organizations: placeGuids,
            presenters: presenterNames
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
      rethrowHttp(err, new InternalServerErrorException(), () => Logger.error(err.message, 'SeasonDayService'));
    }
  }
}

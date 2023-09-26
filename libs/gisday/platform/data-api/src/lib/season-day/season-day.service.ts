import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseProvider } from '../_base/base-provider';
import { SeasonDay } from '../entities/all.entity';

@Injectable()
export class SeasonDayService extends BaseProvider<SeasonDay> {
  constructor(@InjectRepository(SeasonDay) private seasonDayRepo: Repository<SeasonDay>) {
    super(seasonDayRepo);
  }

  public async getDayEvents(guid: string) {
    try {
      const day = await this.seasonDayRepo.findOne({
        where: {
          guid
        },
        relations: ['events']
      });

      if (day) {
        return day.events
          .filter((e) => e.active)
          .sort((a, b) => {
            return a.startTime > b.startTime ? 1 : -1;
          });
      } else {
        throw new NotFoundException();
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseProvider } from '../_base/base-provider';
import { Season, SeasonDay } from '../entities/all.entity';
import { ActiveSeasonDto } from './dto/active-season.dto';

@Injectable()
export class SeasonService extends BaseProvider<Season> {
  constructor(
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    @InjectRepository(SeasonDay) private seasonDayRepo: Repository<SeasonDay>
  ) {
    super(seasonRepo);
  }

  public async findAllOrdered() {
    const seasons = await this.seasonRepo.find({
      order: {
        year: 'ASC'
      },
      relations: ['days']
    });

    if (seasons) {
      return seasons.map((season) => {
        return { ...season, days: this._orderDays(season.days) };
      });
    } else {
      throw new NotFoundException();
    }
  }

  public async findOneWithOrderedDays(guid: string) {
    const season = await this.seasonRepo.findOne({
      where: {
        guid
      },
      relations: ['days']
    });

    if (season) {
      return { ...season, days: this._orderDays(season.days) };
    } else {
      throw new NotFoundException();
    }
  }

  public async findOneActive() {
    const season = await this.seasonRepo.findOne({
      where: {
        active: true
      },
      relations: ['days', 'days.events']
    });

    if (season) {
      const ordered = { ...season, days: this._orderDays(season.days), firstEventTime: null } as ActiveSeasonDto;

      if (ordered.days.length > 0) {
        const firstDay = ordered.days[0];
        const extendedDay = await this.seasonDayRepo.findOne({
          where: {
            guid: firstDay.guid
          },
          relations: ['events']
        });

        const activeEventsForDay = extendedDay.events.filter((event) => {
          return event.active;
        });

        if (activeEventsForDay && activeEventsForDay.length > 0) {
          const orderedActiveEvents = activeEventsForDay.sort((a, b) => {
            return a.startTime < b.startTime ? -1 : 1;
          });

          ordered.firstEventTime = orderedActiveEvents[0].startTime;
        }
      }

      return ordered;
    }

    throw new NotFoundException();
  }

  public async create(createSeasonDto?: Partial<Season>) {
    // If a season is provided, create using params
    if (createSeasonDto && createSeasonDto.year) {
      // If years param is not a number, this will throw a database error
      if (typeof createSeasonDto.year !== 'number') {
        throw new BadRequestException();
      }

      const existing = await this.seasonRepo.findOne({ where: { year: createSeasonDto.year } });

      // Only create a new season if one does not already exist for the given year
      if (existing === undefined) {
        const newSeason = this.seasonRepo.create(createSeasonDto);
        return this.seasonRepo.save(newSeason);
      } else {
        throw new ConflictException();
      }
    } else {
      // If no season is provided, check if there are any other seasons,
      // and if so, create a new season with the next year
      const [latest] = await this.seasonRepo.find({
        order: {
          year: 'DESC'
        },
        take: 1
      });

      let newSeason;

      if (latest) {
        newSeason = this.seasonRepo.create({
          year: latest.year + 1
        });
      } else {
        newSeason = this.seasonRepo.create({
          year: new Date().getFullYear()
        });
      }

      return this.seasonRepo.save(newSeason);
    }
  }

  public async updateSeason(guid: string, updateSeasonDto: Partial<Season>) {
    const existingActive = await this.seasonRepo.findOne({ where: { active: true } });

    // If the incoming has active set to true, and there is an existing active season,
    // and the existing active season is not the same as the incoming season, disable the existing active season.
    if (existingActive && updateSeasonDto.active && existingActive.year !== updateSeasonDto.year) {
      existingActive.active = false;
      await this.seasonRepo.save(existingActive);
    }

    const existingCurrent = await this.seasonRepo.findOne({ where: { guid }, relations: ['days'] });

    if (updateSeasonDto.days) {
      // For days in updateSeasonDto.days that have a guid, update the existing day date
      // For days in updateSeasonDto.days that don't have a guid, create a new day
      // For days in existingCurrent.days that are not in updateSeasonDto.days, delete the day

      const newDays = updateSeasonDto.days
        // Only create new days for those that don't have a guid.
        // This is because the frontend will send back the existing days with the guid.
        .filter((d) => {
          return d.guid === undefined;
        })
        .map((d) => {
          return this.seasonDayRepo.create({
            date: d.date,
            season: existingCurrent
          });
        });

      const updateDays = updateSeasonDto.days
        // Only update existing days for those that have a guid.
        // This is because the frontend will send back the existing days with the guid.
        .filter((d) => {
          return d.guid !== undefined;
        })
        .map((incoming) => {
          const existing = existingCurrent.days.find((day) => {
            return day.guid === incoming.guid;
          });

          // If the dates are the same, don't update the day.

          if (existing.date === incoming.date) {
            return existing;
          } else {
            existing.date = incoming.date;
          }

          return existing;
        });

      existingCurrent.active = updateSeasonDto.active;
      existingCurrent.days = [...newDays, ...updateDays];

      return existingCurrent.save();
    }
  }

  private _orderDays(days: SeasonDay[]) {
    return days.sort((a, b) => {
      return (a.date as any) - (b.date as any);
    });
  }
}

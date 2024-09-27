import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindManyOptions, In, Repository } from 'typeorm';

import { BaseProvider, LookupOneOptions } from '../_base/base-provider';
import {
  Asset,
  Class,
  EventBroadcast,
  EventLocation,
  Organization,
  Place,
  PlaceLink,
  Season,
  SeasonDay,
  Speaker,
  Sponsor,
  Tag,
  University
} from '../entities/all.entity';
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

  /**
   * Finds the active season and returns it with ordered days.
   */
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

    throw new NotFoundException('No active season found.');
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
      const last = await this.getPreviousSeason();

      let newSeason;

      if (last) {
        newSeason = Season.incrementYear(last);
      } else {
        newSeason = Season.createForCurrentYear();
      }

      return this.seasonRepo.save(newSeason);
    }
  }

  public async clonePreviousSeason() {
    const last = await this.getPreviousSeason();

    return await this.seasonRepo.manager.transaction(async (manager) => {
      // Disable previous season. Do this first to prevent any
      // potential side effects;
      if (last.active === true) {
        last.active = false;
        await manager.save(last);
      }

      // Save it first so we have the guid in subsequent relationships
      const nextSeason = await Season.incrementYear(last).save();

      const where = {
        season: last
      };

      const days = (await manager.find(SeasonDay, { where })).map((d: SeasonDay) => {
        delete d.guid;
        delete d.season;
        delete d.created;
        delete d.updated;

        // Change the year of the date object to `nextSeason.year`
        d.date.setFullYear(nextSeason.year);

        return this.seasonRepo.manager.create(SeasonDay, {
          ...d
        });
      });

      const broadcasts = (await manager.find(EventBroadcast, { where })).map((b: EventBroadcast) => {
        delete b.guid;
        delete b.season;
        delete b.created;
        delete b.updated;

        return this.seasonRepo.manager.create(EventBroadcast, {
          ...b
        });
      });

      const classes = (await manager.find(Class, { where })).map((c: Class) => {
        delete c.guid;
        delete c.season;
        delete c.created;
        delete c.updated;

        return this.seasonRepo.manager.create(Class, {
          ...c
        });
      });

      const tags = (await manager.find(Tag, { where })).map((t: Tag) => {
        delete t.guid;
        delete t.season;
        delete t.created;
        delete t.updated;

        return this.seasonRepo.manager.create(Tag, {
          ...t
        });
      });

      const universities = (await manager.find(University, { where })).map((u: University) => {
        delete u.guid;
        delete u.season;
        delete u.created;
        delete u.updated;

        return this.seasonRepo.manager.create(University, {
          ...u
        });
      });

      const places = (await manager.find(Place, { where, relations: ['locations', 'links', 'logos'] })).map((p) => {
        delete p.guid;
        delete p.season;
        delete p.created;
        delete p.updated;

        p.locations = p.locations.map((l) => {
          delete l.guid;
          delete l.created;
          delete l.updated;

          return this.seasonRepo.manager.create(EventLocation, {
            ...l,
            season: nextSeason
          });
        });

        p.links = p.links.map((l) => {
          delete l.guid;
          delete l.created;
          delete l.updated;

          return this.seasonRepo.manager.create(PlaceLink, {
            ...l
          });
        });

        p.logos = p.logos.map((l) => {
          delete l.guid;
          delete l.created;
          delete l.updated;

          return this.seasonRepo.manager.create(Asset, {
            ...l
          });
        });

        return this.seasonRepo.manager.create(Place, {
          ...p
        });
      });

      // const eventLocations = await manager.find(EventLocation, { where, loadRelationIds: true });

      // const organizations = await manager.find(Organization, { where, loadRelationIds: true });

      // const speakers = await manager.find(Speaker, { where, loadRelationIds: true });

      // const sponsors = await manager.find(Sponsor, { where, loadRelationIds: true });

      nextSeason.active = true;
      nextSeason.days = days;
      nextSeason.broadcasts = broadcasts;
      nextSeason.classes = classes;
      nextSeason.tags = tags;
      nextSeason.universities = universities;
      nextSeason.places = places;

      return nextSeason.save();
    });
  }

  public async getPreviousSeason(manager?: EntityManager) {
    const findOptions: FindManyOptions = {
      order: {
        year: 'DESC'
      },
      take: 1
    };

    try {
      if (manager) {
        const [latest] = await manager.find(Season, findOptions);
        return latest;
      } else {
        const [latest] = await this.seasonRepo.find(findOptions);
        return latest;
      }
    } catch (err) {
      throw new UnprocessableEntityException('No previous season found.');
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

  public override async deleteEntity(guidOrOptions?: LookupOneOptions<Season>) {
    const existing = await this.seasonRepo.findOne({
      where: {
        guid: guidOrOptions
      },
      loadRelationIds: {
        relations: ['speakers', 'organizations', 'sponsors', 'places', 'tags']
      }
    });

    if (existing) {
      // in a typeorm transaction, remove all the speaker images, organization logos, sponsor logos, and places logos,
      // then remove the season
      return await this.seasonRepo.manager
        .transaction(async (manager) => {
          //
          // Get all the images and delete those from entities first
          //

          const speakerImages = await this.seasonRepo.manager.find(Asset, {
            where: {
              speaker: In(existing.speakers)
            }
          });

          const organizationImages = await this.seasonRepo.manager.find(Asset, {
            where: {
              organization: In(existing.organizations)
            }
          });

          const sponsorImages = await this.seasonRepo.manager.find(Asset, {
            where: {
              sponsor: In(existing.sponsors)
            }
          });

          const placeImages = await this.seasonRepo.manager.find(Asset, {
            where: {
              places: In(existing.places)
            }
          });

          //
          // Get the actual speakers, sponsor, and tag entities since the `remove` method requires the actual entity
          //

          const speakers = await this.seasonRepo.manager.findByIds(Speaker, existing.speakers);
          const organizations = await this.seasonRepo.manager.findByIds(Organization, existing.organizations);
          const sponsors = await this.seasonRepo.manager.findByIds(Sponsor, existing.sponsors);
          const tags = await this.seasonRepo.manager.findByIds(Tag, existing.tags);

          await manager.remove(speakerImages);
          await manager.remove(organizationImages);
          await manager.remove(sponsorImages);
          await manager.remove(placeImages);
          await manager.remove(speakers);
          await manager.remove(organizations);
          await manager.remove(sponsors);
          await manager.remove(tags);

          const result = await manager.remove(existing);

          const last = await this.getPreviousSeason(manager);

          if (last && last.active === false) {
            last.active = true;
            await manager.save(last);
          }

          return result;
        })
        .catch((error) => {
          Logger.error(error.message, error.stack, 'SeasonService.deleteEntity');
          throw new InternalServerErrorException('Error deleting season.');
        });
    } else {
      throw new NotFoundException();
    }
  }

  private _orderDays(days: SeasonDay[]) {
    return days.sort((a, b) => {
      return (a.date as unknown as number) - (b.date as unknown as number);
    });
  }
}

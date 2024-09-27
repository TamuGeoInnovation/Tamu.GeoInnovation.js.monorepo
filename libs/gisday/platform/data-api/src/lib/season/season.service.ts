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
import { BaseEntity, EntityManager, FindManyOptions, In, Repository } from 'typeorm';

import { BaseProvider, LookupOneOptions } from '../_base/base-provider';
import {
  Asset,
  Class,
  Event,
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

      // Clone days, stripping guid, created, updated, and season properties
      const days = (await manager.find(SeasonDay, { where })).map((d: SeasonDay) => {
        const day = this._stripEntityProperties(d, ['date']);

        // Change the year of the date object to `nextSeason.year`
        const dateClone = new Date(d.date);
        dateClone.setFullYear(nextSeason.year);

        day.date = dateClone;

        return this.seasonRepo.manager.create(SeasonDay, day);
      });

      // Clone broadcasts, stripping guid, created, updated, and season properties
      const broadcasts = (await manager.find(EventBroadcast, { where })).map((b: EventBroadcast) => {
        const eventBroadcast = this._stripEntityProperties(b);

        return this.seasonRepo.manager.create(EventBroadcast, eventBroadcast);
      });

      // Clone classes, stripping guid, created, updated, and season properties
      const classes = (await manager.find(Class, { where })).map((c: Class) => {
        const clonedClass = this._stripEntityProperties(c);

        return this.seasonRepo.manager.create(Class, clonedClass);
      });

      // Clone tags, stripping guid, created, updated, and season properties
      const tags = (await manager.find(Tag, { where })).map((t: Tag) => {
        const tag = this._stripEntityProperties(t);

        return this.seasonRepo.manager.create(Tag, tag);
      });

      // Clone universities, stripping guid, created, updated, and season properties
      const universities = (await manager.find(University, { where })).map((u: University) => {
        const university = this._stripEntityProperties(u);

        return this.seasonRepo.manager.create(University, university);
      });

      // Clone places, stripping guid, created, updated, and season properties. Also clones inner locations, links, and logos
      // The inner entities cascade down when the parent is saved. This saves time and hassle of cloning those entities separately
      // and linking them to the parent.
      const places = (await manager.find(Place, { where, relations: ['locations', 'links', 'logos'] })).map((p) => {
        const place = this._stripEntityProperties(p);

        // Clone locations and stripping guid, created, and updated properties
        place.locations = p.locations.map((l) => {
          const location = this._stripEntityProperties(l);

          return this.seasonRepo.manager.create(EventLocation, {
            ...location,
            season: nextSeason
          });
        });

        // Clone links and stripping guid, created, and updated properties
        place.links = p.links.map((l) => {
          const link = this._stripEntityProperties(l);

          return this.seasonRepo.manager.create(PlaceLink, link);
        });

        // Clone logos and stripping guid, created, and updated properties
        place.logos = p.logos.map((l) => {
          const logo = this._stripEntityProperties(l);

          return this.seasonRepo.manager.create(Asset, logo);
        });

        return this.seasonRepo.manager.create(Place, {
          ...place
        });
      });

      // Clone organizations stripping guid, created, and updated properties. Also clones logos
      const organizations = (await manager.find(Organization, { where, relations: ['logos'] })).map((o: Organization) => {
        const organization = this._stripEntityProperties(o);

        organization.logos = o.logos.map((l) => {
          const logo = this._stripEntityProperties(l);

          return this.seasonRepo.manager.create(Asset, logo);
        });

        return this.seasonRepo.manager.create(Organization, {
          ...organization,
          season: nextSeason
        });
      });

      // Clone sponsors stripping guid, created, and updated properties. Also clones logos
      const sponsors = (await manager.find(Sponsor, { where, relations: ['logos'] })).map((s: Sponsor) => {
        const sponsor = this._stripEntityProperties(s);

        sponsor.logos = s.logos.map((l) => {
          const logo = this._stripEntityProperties(l);

          return this.seasonRepo.manager.create(Asset, logo);
        });

        return this.seasonRepo.manager.create(Sponsor, {
          ...sponsor,
          season: nextSeason
        });
      });

      nextSeason.active = true;
      nextSeason.days = days;
      nextSeason.broadcasts = broadcasts;
      nextSeason.classes = classes;
      nextSeason.tags = tags;
      nextSeason.universities = universities;
      nextSeason.places = places;

      // Chunk these otherwise the query will fail because parameter limit exceeded.
      const savedOrgs = await manager.save(organizations, { chunk: 25 });

      // Save sponsors, but not necessary to store the results in variable
      await manager.save(sponsors, { chunk: 25 });

      // Save nextSeason here so we have the generated guids that are required for speakers and events
      const savedSeason = await manager.save(nextSeason);

      // Prepare dictionaries to set the correct relationships on speakers and events
      const orgDict = new EntityKeyDictionary(savedOrgs, this.ENTITY_PK_LUT.organization);
      const uniDict = new EntityKeyDictionary(nextSeason.universities, this.ENTITY_PK_LUT.university);

      const speakers = (await manager.find(Speaker, { where, relations: ['organization', 'university', 'images'] })).map(
        (s: Speaker) => {
          const speaker = this._stripEntityProperties(s);

          speaker.organization = orgDict.find(speaker.organization);
          speaker.university = uniDict.find(speaker.university);

          speaker.images = s.images.map((i) => {
            const image = this._stripEntityProperties(i);

            return this.seasonRepo.manager.create(Asset, image);
          });

          return this.seasonRepo.manager.create(Speaker, {
            ...speaker,
            season: savedSeason
          });
        }
      );

      const savedSpeakers = await manager.save(speakers, { chunk: 25 });
      const savedLocations = nextSeason.places.reduce((acc, place) => {
        return [...acc, ...place.locations];
      }, [] as Array<EventLocation>);

      const dayDict = new EntityKeyDictionary(nextSeason.days, this.ENTITY_PK_LUT.seasonDay, (day) => {
        // get day and month only in MM-DD format
        return day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      });
      const speakerDict = new EntityKeyDictionary(savedSpeakers, this.ENTITY_PK_LUT.speaker);
      const tagDict = new EntityKeyDictionary(nextSeason.tags, this.ENTITY_PK_LUT.tag);
      const broadcastDict = new EntityKeyDictionary(nextSeason.broadcasts, this.ENTITY_PK_LUT.eventBroadcast);
      const locationDict = new EntityKeyDictionary(savedLocations, this.ENTITY_PK_LUT.eventLocation);

      // Get all events for previous season
      const events = (
        await manager
          .createQueryBuilder(Season, 'season')
          .leftJoinAndSelect('season.days', 'day')
          .leftJoinAndSelect('day.events', 'event')
          .leftJoinAndSelect('event.day', 'eventDay')
          .leftJoinAndSelect('event.speakers', 'speakers')
          .leftJoinAndSelect('event.tags', 'tags')
          .leftJoinAndSelect('event.broadcast', 'broadcast')
          .leftJoinAndSelect('event.location', 'location')
          .where('season.guid = :guid', { guid: where.season.guid })
          .getOne()
      ).days
        .map((d) => d.events)
        .flat()
        .map((e: Event) => {
          const event = this._stripEntityProperties(e);

          // OOF, YIKES, WOWZERS
          event.day = dayDict.find(event.day);
          event.speakers = e.speakers.map((s) => speakerDict.find(s));
          event.tags = e.tags.map((t) => tagDict.find(t));
          event.broadcast = broadcastDict.find(e.broadcast);
          event.location = locationDict.find(e.location);

          return this.seasonRepo.manager.create(Event, {
            ...event
          });
        });

      await manager.save(events, { chunk: 25 });

      return nextSeason;
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

  private _stripEntityProperties<T extends BaseEntity>(entity: T, properties?: Array<keyof T>) {
    const defaultRemoveList = ['guid', 'created', 'updated'] as Array<keyof T>;
    const shallowClone = { ...entity };
    const completePropList = properties && properties.length > 0 ? [...defaultRemoveList, ...properties] : defaultRemoveList;

    completePropList.forEach((property) => {
      delete shallowClone[property];
    });

    return { ...shallowClone };
  }

  private ENTITY_PK_LUT: EntityPrimaryKeyMap = {
    organization: ['name', 'acronym', 'website'],
    university: ['name', 'acronym', 'hexTriplet'],
    speaker: ['firstName', 'lastName', 'email'],
    seasonDay: ['date'],
    tag: ['name'],
    eventBroadcast: ['name', 'presenterUrl'],
    eventLocation: ['building', 'room']
  };
}

class EntityKeyDictionary<T extends BaseEntity> {
  private _dict: Map<string, BaseEntity>;
  private _entities: Array<T>;
  private _entityPkRef: Array<keyof T>;
  private _primaryKeyFn: (e: T) => string;

  /**
   * Creates a dictionary of entities, using the primary key as a concatenation of the entity key values and the value
   * as the entity itself.
   *
   * This map is used to relate cloned entities to their original entities when cloning a season. This is necessary because
   * the cloned entities will have new guids.
   *
   * Can optionally provide a function to generate the primary key. This function will be used for generation and lookups.
   */
  constructor(entities: Array<T>, primaryKey: Array<keyof T>, primaryKeyFn?: (e: T) => string) {
    this._entities = entities;
    this._entityPkRef = primaryKey;
    this._primaryKeyFn = primaryKeyFn;
    this._dict = this._generateKeyDict(entities, primaryKey, primaryKeyFn);
  }

  private _generateKeyDict<T extends BaseEntity>(
    entities: Array<T>,
    primaryKey: Array<keyof T>,
    primaryKeyFn?: (k: T) => string
  ) {
    const dict = new Map<string, T>();

    entities.forEach((e: T) => {
      const key = primaryKey.map((k) => {
        return primaryKeyFn !== undefined ? primaryKeyFn(e) : e[`${String(k)}`];
      });

      dict.set(key.join(''), e);
    });

    return dict;
  }

  public find(entity: T): T {
    if (!entity) {
      return undefined;
    }

    const key = this._entityPkRef.map((k) => {
      return this._primaryKeyFn !== undefined ? this._primaryKeyFn(entity) : entity[`${String(k)}`];
    });

    return this._dict.get(key.join('')) as T;
  }
}

interface EntityPrimaryKeyMap {
  organization: Array<keyof Organization>;
  university: Array<keyof University>;
  speaker: Array<keyof Speaker>;
  seasonDay: Array<keyof SeasonDay>;
  tag: Array<keyof Tag>;
  eventBroadcast: Array<keyof EventBroadcast>;
  eventLocation: Array<keyof EventLocation>;
}

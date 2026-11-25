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
import { BaseEntity, DeepPartial, EntityManager, FindManyOptions, In, Repository } from 'typeorm';

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
  SeasonCompetition,
  Tag,
  University
} from '../entities/all.entity';
import {
  CompetitionSettingsInput,
  SEASON_COMPETITIONS,
  SUBMISSION_DEADLINE_FIELDS,
  SubmissionDeadlines,
  asDate,
  chosenSessionGuids,
  competitionSettingsProblem,
  competitionTypesProblem,
  competitionTypesValue,
  deadlinesProblem
} from '@tamu-gisc/gisday/common';

import { ActiveSeasonDto } from './dto/active-season.dto';
import { rethrowHttp } from '../_base/rethrow-http';

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
      relations: { days: true }
    });

    return seasons.map((season) => {
      return { ...season, days: this._orderDays(season.days) };
    });
  }

  public async findOneWithOrderedDays(guid: string) {
    const season = await this.seasonRepo.findOne({
      where: {
        guid
      },
      relations: { days: true }
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
      relations: { days: { events: true } }
    });

    if (!season) {
      throw new NotFoundException('No active season found.');
    }

    return this._withFirstEventTime(season);
  }

  /**
   * Finds the season for a year, in the same shape as the active season, so a page can show a past
   * year exactly as it shows the current one (#1758).
   */
  public async findOneByYear(year: number) {
    if (!Number.isInteger(year)) {
      throw new BadRequestException('A season is looked up by a whole year, for example 2025.');
    }

    const season = await this.seasonRepo.findOne({
      where: {
        year
      },
      relations: { days: { events: true } }
    });

    if (!season) {
      throw new NotFoundException(`No season found for ${year}.`);
    }

    return this._withFirstEventTime(season);
  }

  /**
   * A season by its guid with its days and their events, which is what listing the people speaking at
   * a season's events needs.
   */
  public async findOneWithDaysAndEvents(guid: string) {
    const season = await this.seasonRepo.findOne({
      where: {
        guid
      },
      relations: { days: { events: true } }
    });

    if (!season) {
      throw new NotFoundException();
    }

    return season;
  }

  /**
   * Orders a season's days and adds the start time of the earliest active event on its first day.
   */
  private async _withFirstEventTime(season: Season) {
    const days = this._orderDays(season.days);
    let firstEventTime: string | null = null;

    if (days.length > 0) {
      const extendedDay = await this.seasonDayRepo.findOne({
        where: {
          guid: days[0].guid
        },
        relations: { events: true }
      });

      // A day deleted between the two reads has no events to start the season with.
      const activeEventsForDay = (extendedDay?.events ?? []).filter((event) => {
        return event.active;
      });

      if (activeEventsForDay.length > 0) {
        const orderedActiveEvents = activeEventsForDay.sort((a, b) => {
          // An event with no start time last, as the dashboards order them.
          return (a.startTime ?? '￿') < (b.startTime ?? '￿') ? -1 : 1;
        });

        firstEventTime = orderedActiveEvents[0].startTime;
      }
    }

    // `satisfies`, not a cast to the DTO (whose fields are all optional), so callers keep the season's guid.
    return { ...season, days, firstEventTime } satisfies ActiveSeasonDto;
  }

  public async create(createSeasonDto?: DeepPartial<Season>) {
    // If a season is provided, create using params
    if (createSeasonDto && createSeasonDto.year) {
      // If years param is not a number, this will throw a database error
      if (typeof createSeasonDto.year !== 'number') {
        throw new BadRequestException();
      }

      const existing = await this.seasonRepo.findOne({ where: { year: createSeasonDto.year } });

      // Only create a new season if one does not already exist for the given year.
      //
      // This read `existing === undefined`, which TypeORM 0.2 would satisfy. Since 0.3 `findOne`
      // resolves to `null` when nothing matches, so the comparison was never true, every call fell
      // through to the `else`, and creating a season for a year that did not exist yet answered
      // 409 Conflict. Truthiness covers both.
      if (!existing) {
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
      // Turn off whichever season is active, first, so the new season is the only active one. Not only the latest season by
      // year: with a later season that is not active, that left the active one on, and the clone made two (#3571).
      await manager.update(Season, { active: true }, { active: false });

      // Save it first so we have the guid in subsequent relationships
      const nextSeason = await Season.incrementYear(last).save();

      // By its key, never the whole loaded season (#3302): its deadlines are null until an admin sets them, and typeorm 1
      // refuses a null anywhere inside a where value.
      const where = {
        season: { guid: last.guid }
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
      const places = (await manager.find(Place, { where, relations: { locations: true, links: true, logos: true } })).map(
        (p) => {
          const place = this._stripEntityProperties(p);

          // Clone locations and stripping guid, created, and updated properties. `locations`, `links` and `logos` are
          // loaded by this find's `relations`, so they are present.
          place.locations = p.locations!.map((l) => {
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
          place.logos = p.logos!.map((l) => {
            const logo = this._stripEntityProperties(l);

            return this.seasonRepo.manager.create(Asset, logo);
          });

          return this.seasonRepo.manager.create(Place, {
            ...place
          });
        }
      );

      // Clone organizations stripping guid, created, and updated properties. Also clones logos
      const organizations = (await manager.find(Organization, { where, relations: { logos: true } })).map(
        (o: Organization) => {
          const organization = this._stripEntityProperties(o);

          // `logos` is loaded by this find's `relations`.
          organization.logos = o.logos!.map((l) => {
            const logo = this._stripEntityProperties(l);

            return this.seasonRepo.manager.create(Asset, logo);
          });

          return this.seasonRepo.manager.create(Organization, {
            ...organization,
            season: nextSeason
          });
        }
      );

      // Clone sponsors stripping guid, created, and updated properties. Also clones logos
      const sponsors = (await manager.find(Sponsor, { where, relations: { logos: true } })).map((s: Sponsor) => {
        const sponsor = this._stripEntityProperties(s);

        // `logos` is loaded by this find's `relations`.
        sponsor.logos = s.logos!.map((l) => {
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

      const speakers = (
        await manager.find(Speaker, { where, relations: { organization: true, university: true, images: true } })
      ).map((s: Speaker) => {
        const speaker = this._stripEntityProperties(s);

        speaker.university = uniDict.find(speaker.university);

        // `images` is loaded by this find's `relations`.
        speaker.images = s.images!.map((i) => {
          const image = this._stripEntityProperties(i);

          return this.seasonRepo.manager.create(Asset, image);
        });

        // The organization here, where the speaker is built: a speaker with none has none in the copy either.
        return this.seasonRepo.manager.create(Speaker, {
          ...speaker,
          organization: orgDict.find(speaker.organization),
          season: savedSeason
        });
      });

      const savedSpeakers = await manager.save(speakers, { chunk: 25 });
      const savedLocations = nextSeason.places.reduce((acc, place) => {
        // Every copied place above was given its `locations`.
        return [...acc, ...place.locations!];
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
          .createQueryBuilder(Event, 'event')
          .leftJoinAndSelect('event.day', 'eventDay')
          .leftJoinAndSelect('event.speakers', 'speakers')
          .leftJoinAndSelect('event.tags', 'tags')
          .leftJoinAndSelect('event.broadcast', 'broadcast')
          .leftJoinAndSelect('event.location', 'location')
          .where('event.season = :guid', { guid: where.season.guid })
          .getMany()
      ).map((e: Event) => {
        const event = this._stripEntityProperties(e);

        // OOF, YIKES, WOWZERS
        // `speakers` and `tags` are joined by this query, so they are present (empty when there are none).
        event.speakers = e.speakers!.map((s) => speakerDict.find(s)).filter((s) => s !== undefined);
        event.tags = e.tags!.map((t) => tagDict.find(t)).filter((t) => t !== undefined);
        event.broadcast = broadcastDict.find(e.broadcast);
        event.location = locationDict.find(e.location);

        // The day here, where the event is built: an event with none has none in the copy either.
        return this.seasonRepo.manager.create(Event, {
          ...event,
          day: dayDict.find(event.day),
          season: nextSeason
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
      rethrowHttp(err, new UnprocessableEntityException('No previous season found.'));
    }
  }

  public async updateSeason(guid: string, updateSeasonDto: SeasonUpdate) {
    // Looked up first, so a season that does not exist answers 404 before another season is deactivated for it.
    const existingCurrent = await this.seasonRepo.findOne({ where: { guid }, relations: { days: true } });

    if (!existingCurrent) {
      throw new NotFoundException();
    }

    const existingActive = await this.seasonRepo.findOne({ where: { active: true } });

    // If the incoming has active set to true, and there is an existing active season,
    // and the existing active season is not the same as the incoming season, disable the existing active season.
    if (existingActive && updateSeasonDto.active && existingActive.year !== updateSeasonDto.year) {
      existingActive.active = false;
      await this.seasonRepo.save(existingActive);
    }

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

          if (!existing) {
            throw new NotFoundException(`The season has no day ${incoming.guid}.`);
          }

          // If the dates are the same, don't update the day.

          if (existing.date === incoming.date) {
            return existing;
          } else {
            existing.date = incoming.date;
          }

          return existing;
        });

      // Left as it is when the update does not say.
      existingCurrent.active = updateSeasonDto.active ?? existingCurrent.active;
      existingCurrent.days = [...newDays, ...updateDays];

      return existingCurrent.save();
    }
  }

  /**
   * Sets when the season's competitions close (#2934, #2962): every moment, each a date or empty
   * for open, as the admin page sends them. Refuses a moment that is not a date, and files that would close before
   * their competition's submissions.
   */
  public async setSubmissionDeadlines(
    guid: string,
    deadlines: SubmissionDeadlines | undefined
  ): Promise<SubmissionDeadlines> {
    // A request with no body sends none: refused, rather than read as every deadline cleared (#3495).
    if (!deadlines) {
      throw new BadRequestException('Send the deadlines, each a date or empty for open.');
    }

    const problem = deadlinesProblem(deadlines);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const season = await this.seasonRepo.findOne({ where: { guid } });

    if (!season) {
      throw new NotFoundException('Season not found.');
    }

    const values = Object.fromEntries(SUBMISSION_DEADLINE_FIELDS.map((field) => [field, asDate(deadlines[field])]));

    await this.seasonRepo.update(guid, values);

    return values;
  }

  /**
   * Sets which research competitions the season runs (#2948), as the admin page sends them: a list naming at least one.
   * Each chosen competition's row says it `runs`. Every one is stored as no row that runs, so the season runs whatever is
   * added later, as a season set before this does. A competition's row also holds its settings (#3019), so a row turned
   * off keeps them (`runs` empty), and only a row left with nothing is removed.
   */
  public async setCompetitionTypes(guid: string, competitions: unknown): Promise<{ competitionTypes: Array<string> }> {
    const problem = competitionTypesProblem(competitions);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const season = await this.seasonRepo.findOne({ where: { guid } });

    if (!season) {
      throw new NotFoundException('Season not found.');
    }

    const competitionTypes = competitionTypesValue(competitions as Array<string>);

    await this.seasonRepo.manager.transaction(async (manager) => {
      const rows = await manager.find(SeasonCompetition, { where: { season: { guid } } });
      const marked = SEASON_COMPETITIONS.flatMap<Partial<SeasonCompetition>>((competitionType) => {
        const runs = competitionTypes.includes(competitionType) ? true : null;
        const row = rows.find((existing) => existing.competitionType === competitionType);

        if (row) {
          return [{ ...row, runs }];
        }

        return runs ? [manager.create(SeasonCompetition, { season: { guid }, competitionType, runs })] : [];
      });
      const empty = marked.filter((row) => !row.runs && !hasSettings(row));

      if (empty.length > 0) {
        await manager.delete(
          SeasonCompetition,
          empty.map((row) => row.guid)
        );
      }

      const kept = marked.filter((row) => !empty.includes(row));

      if (kept.length > 0) {
        await manager.save(SeasonCompetition, kept);
      }
    });

    return { competitionTypes };
  }

  /**
   * Sets each listed competition's settings for the season (#3019, decided 6A and 7A): its sessions, chosen from the
   * season's own, and when its finalists hear. A competition with no row gets one that holds only settings (`runs`
   * empty), so it changes nothing about which competitions the season runs.
   */
  public async setCompetitionSettings(guid: string, settings: unknown): Promise<{ saved: number }> {
    const problem = competitionSettingsProblem(settings);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const season = await this.seasonRepo.findOne({ where: { guid } });

    if (!season) {
      throw new NotFoundException('Season not found.');
    }

    const listed = settings as Array<CompetitionSettingsInput>;

    return this.seasonRepo.manager.transaction(async (manager) => {
      const named = chosenSessionGuids(listed);
      const own = named.length
        ? await manager.find(Event, { where: { guid: In(named), season: { guid } }, select: { guid: true } })
        : [];
      const elsewhere = named.find((sessionGuid) => !own.some((event) => event.guid === sessionGuid));

      if (elsewhere) {
        throw new BadRequestException(`${elsewhere} is not one of this season's sessions.`);
      }

      const rows = await manager.find(SeasonCompetition, { where: { season: { guid } } });
      const saved = listed.map<Partial<SeasonCompetition>>((input) => {
        const values = {
          sessionGuid: input.sessionGuid || null,
          graduateSessionGuid: input.graduateSessionGuid || null,
          awardsSessionGuid: input.awardsSessionGuid || null,
          finalistsNotifiedAt: asDate(input.finalistsNotifiedAt)
        };
        const row = rows.find((existing) => existing.competitionType === input.competitionType);

        return row
          ? { ...row, ...values }
          : manager.create(SeasonCompetition, {
              season: { guid },
              competitionType: input.competitionType,
              runs: null,
              ...values
            });
      });

      await manager.save(SeasonCompetition, saved);

      return { saved: saved.length };
    });
  }

  public override async deleteEntity(guidOrOptions: LookupOneOptions<Season>) {
    const where =
      typeof guidOrOptions === 'string' ? { guid: guidOrOptions } : (guidOrOptions as { where?: { guid?: string } }).where;

    const existing = await this.seasonRepo.findOne({
      where,
      loadRelationIds: {
        relations: ['speakers', 'organizations', 'sponsors', 'places', 'tags', 'events']
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
          // Get the actual speakers, sponso  r, and tag entities since the `remove` method requires the actual entity
          //

          const speakers = await this.seasonRepo.manager.find(Speaker, {
            where: { guid: In(existing.speakers as unknown as string[]) }
          });
          const organizations = await this.seasonRepo.manager.find(Organization, {
            where: { guid: In(existing.organizations as unknown as string[]) }
          });
          const sponsors = await this.seasonRepo.manager.find(Sponsor, {
            where: { guid: In(existing.sponsors as unknown as string[]) }
          });
          const tags = await this.seasonRepo.manager.find(Tag, {
            where: { guid: In(existing.tags as unknown as string[]) }
          });
          const events = await this.seasonRepo.manager.find(Event, {
            where: { guid: In(existing.events as unknown as string[]) }
          });

          await manager.remove(speakerImages);
          await manager.remove(organizationImages);
          await manager.remove(sponsorImages);
          await manager.remove(placeImages);
          await manager.remove(speakers);
          await manager.remove(organizations);
          await manager.remove(sponsors);
          await manager.remove(tags);
          await manager.remove(events);

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
  private _dict: Map<string, T>;
  private _entities: Array<T>;
  private _entityPkRef: Array<keyof T>;
  private _primaryKeyFn?: (e: T) => string;

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

  /** The copy matching `entity`, or nothing when there is no entity (an empty relation) or no copy of it. */
  public find(entity: T | null | undefined): T | undefined {
    if (!entity) {
      return undefined;
    }

    const key = this._entityPkRef.map((k) => {
      return this._primaryKeyFn !== undefined ? this._primaryKeyFn(entity) : entity[`${String(k)}`];
    });

    return this._dict.get(key.join(''));
  }
}

/** A season's changes as the admin page sends them: its days without an id are new ones. */
export type SeasonUpdate = Omit<Partial<Season>, 'days'> & { days?: Array<{ guid?: string; date: Date }> };

interface EntityPrimaryKeyMap {
  organization: Array<keyof Organization>;
  university: Array<keyof University>;
  speaker: Array<keyof Speaker>;
  seasonDay: Array<keyof SeasonDay>;
  tag: Array<keyof Tag>;
  eventBroadcast: Array<keyof EventBroadcast>;
  eventLocation: Array<keyof EventLocation>;
}

/** Whether a competition's row holds any of its settings (#3019), so it is kept when the competition is turned off. */
function hasSettings(row: Partial<SeasonCompetition>): boolean {
  return Boolean(row.sessionGuid || row.graduateSessionGuid || row.awardsSessionGuid || row.finalistsNotifiedAt);
}

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, groupBy, mergeMap, toArray } from 'rxjs';
import { DeepPartial, In, Repository } from 'typeorm';

import { judgedCompetitionProblem } from '@tamu-gisc/gisday/common';

import {
  EntityRelationsLUT,
  Event,
  EventBroadcast,
  EventLocation,
  Season,
  Speaker,
  Sponsor,
  Tag,
  UserRsvp
} from '../entities/all.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventAttendanceDto } from './dto/event-attendance.dto';
import { SeasonService } from '../season/season.service';
import { rethrowHttp } from '../_base/rethrow-http';
import { SeasonScopedProvider } from '../_base/season-scoped-provider';

@Injectable()
export class EventProvider extends SeasonScopedProvider<Event> {
  protected get seasons() {
    return this.seasonProvider;
  }

  protected readonly recordsName = 'sessions';

  protected forSeason(seasonGuid: string) {
    return this.getEventsForSeason(seasonGuid);
  }

  constructor(
    @InjectRepository(Event) public eventRepo: Repository<Event>,
    @InjectRepository(EventLocation) private eventLocationRepo: Repository<EventLocation>,
    @InjectRepository(EventBroadcast) private eventBroadcastRepo: Repository<EventBroadcast>,
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    @InjectRepository(UserRsvp) private userRsvpRepo: Repository<UserRsvp>,
    @InjectRepository(Season) private seasonRepo: Repository<Season>,
    private readonly seasonProvider: SeasonService
  ) {
    super(eventRepo);
  }

  public async getEventsForActiveSeason() {
    return this.forActiveSeason();
  }

  public async getEventsForSeason(seasonGuid: string) {
    if (seasonGuid) {
      const events = await this.eventRepo
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.day', 'eventDay')
        .leftJoinAndSelect('event.location', 'location')
        // Its place, so a site that lists only some organizations' sessions can tell which are its own (#2986).
        .leftJoinAndSelect('location.place', 'place')
        // Its tags, so the admin Events list can find the sessions with none (#3034).
        .leftJoinAndSelect('event.tags', 'tags')
        .where('event.season = :guid', { guid: seasonGuid })
        .orderBy('eventDay.date', 'ASC')
        .addOrderBy('event.startTime', 'ASC')
        .getMany();

      return events;
    } else {
      throw new NotFoundException();
    }
  }

  public async getEvents() {
    return this.eventRepo.find({
      relations: EntityRelationsLUT.getRelation('event'),
      order: {
        startTime: 'ASC'
      }
    });
  }

  public async insertEvent(event: DeepPartial<Event>) {
    try {
      const newEvent: DeepPartial<Event> = {
        ...event
      };

      // TODO: fix this
      // const broadcastEnt = this.eventBroadcastRepo.create(event.broadcast);
      // const locationEnt = this.eventLocationRepo.create(event.location);

      const existingSpeakers = await this.speakerRepo.find({
        where: {
          guid: In(event.speakers)
        }
      });

      const existingTags = await this.tagRepo.find({
        where: {
          guid: In(event.tags)
        }
      });

      // TODO: fix this
      // newEvent.broadcast = broadcastEnt;
      // newEvent.location = locationEnt;
      newEvent.speakers = existingSpeakers;
      newEvent.tags = existingTags;

      // Its judging (#3183), checked as an update's is: its judges among its speakers.
      Object.assign(
        newEvent,
        judgingOf(
          event as unknown as UpdateEventDto,
          existingSpeakers.map((s) => s.guid)
        )
      );

      const eventEnt = this.eventRepo.create(newEvent);

      if (eventEnt) {
        return eventEnt.save();
      }
    } catch (error) {
      rethrowHttp(error, new UnprocessableEntityException(null, 'Could not insert new Event'));
    }
  }

  public async updateEvent(guid: string, event: UpdateEventDto) {
    try {
      const existingEvent = await this.eventRepo.findOne({
        where: {
          guid
        }
      });

      if (!existingEvent) {
        throw new NotFoundException();
      }

      // `UpdateEventDto` declares both as required and TypeScript enforces that at every call site
      // it can see -- but it is an interface, so `ValidationPipe` has no metadata to check a
      // request against and an HTTP caller can omit them. Doing so threw a TypeError here, which
      // the catch below reported as 422 "Could not insert new Event": wrong reason, wrong verb.
      const tags = (event.tags ?? []).map((t) => {
        return this.tagRepo.create({ guid: t });
      });
      const speakers = (event.speakers ?? []).map((t) => this.speakerRepo.create({ guid: t }));
      // Its judging (#3183): the competition, whether closed, and its judges, who must be among its speakers as sent.
      const { judges, ...fields } = event;
      const judging = judgingOf({ ...fields, judges }, event.speakers ?? []);

      const newEnt = this.eventRepo.create({
        ...existingEvent,
        ...fields,
        ...judging,
        tags,
        speakers
      });

      return newEnt.save();
    } catch (error) {
      // Was "Could not insert new Event" -- copy-pasted from insertEvent, and misleading when it
      // surfaces on an update.
      rethrowHttp(error, new UnprocessableEntityException(null, 'Could not update Event'));
    }
  }

  /**
   * A session's judging (#3183), for its admin form: the competition its judges score, whether judging is closed, and its
   * judges by id. Its own route, so the public session page never lists the judges.
   */
  public async getJudging(guid: string) {
    const event = await this.eventRepo.findOne({ where: { guid }, relations: { judges: true } });

    if (!event) {
      throw new NotFoundException();
    }

    return {
      judgedCompetition: event.judgedCompetition ?? null,
      judgingClosed: Boolean(event.judgingClosed),
      judges: (event.judges ?? []).map((j) => j.guid)
    };
  }

  public async getEntitiesByDay() {
    const events = this.eventRepo.find();
    const entities = from(events).pipe(
      mergeMap((events) => events),
      groupBy((event) => {
        const day = new Date(event.startTime).getDay();
        return day;
      }),
      mergeMap((group) => group.pipe(toArray())),
      toArray()
    );

    return entities;
  }

  public async getNumberOfRsvps(eventGuid: string) {
    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      }
    });

    if (event) {
      // By the event's key, not the loaded event, whose null columns typeorm 1 refuses in a where value.
      return this.userRsvpRepo.count({
        where: {
          event: { guid: event.guid }
        }
      });
    } else {
      return 0;
    }
  }

  /**
   * Returns event details, including any sensitive information if the user is logged in.
   */
  public async getEventDetails(eventGuid: string, isLoggedIn?: boolean) {
    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      },
      relations: EntityRelationsLUT.getRelation('event')
    });

    if (!event) {
      throw new NotFoundException();
    }

    if (!isLoggedIn) {
      event.broadcast = null;
      event.resources = null;
      event.requirements = null;
    }

    return event;
  }

  public async getEventAttendance(eventGuid: string) {
    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      },
      select: { observedAttendeeStart: true, observedAttendeeEnd: true, guid: true }
    });

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  /**
   * Puts events on the public schedule, or takes them off it, changing `active` and nothing else (#2092).
   * `updateEvent` cannot do this: it treats omitted speakers and tags as empty, so it would remove them.
   */
  public async setActive(guids: Array<string>, active: boolean) {
    if (!Array.isArray(guids) || guids.length === 0 || typeof active !== 'boolean') {
      throw new BadRequestException('Give the events to change, and true or false.');
    }

    const result = await this.eventRepo.update({ guid: In(guids) }, { active });

    return { updated: result.affected ?? 0 };
  }

  public async updateAttendance(eventGuid: string, counts: EventAttendanceDto) {
    const event = await this.eventRepo.findOne({
      where: {
        guid: eventGuid
      }
    });

    if (!event) {
      throw new NotFoundException();
    }

    if (counts.observedAttendeeStart !== undefined) {
      event.observedAttendeeStart = counts.observedAttendeeStart;
    }

    if (counts.observedAttendeeEnd !== undefined) {
      event.observedAttendeeEnd = counts.observedAttendeeEnd;
    }

    return event.save();
  }

  /**
   * Copies the provided events into the provided season.
   *
   * Lookups are performed for the provided season guid and event guids
   */
  public async copyEventsIntoSeason(seasonGuid: string, eventGuids: Array<string>) {
    // User query builder to get season by guid, getting days relation, and ordering by date
    const season = await this.seasonRepo
      .createQueryBuilder('season')
      .leftJoinAndSelect('season.days', 'day')
      .where('season.guid = :guid', { guid: seasonGuid })
      .orderBy('day.date', 'ASC')
      .getOne();

    if (!season) {
      throw new NotFoundException();
    }

    if (season.days.length === 0) {
      throw new UnprocessableEntityException(null, 'Season has no days');
    }

    const events = await this.eventRepo.find({
      where: {
        guid: In(eventGuids)
      }
    });

    // Was `if (!events)`. `find` resolves to an array, never null, so this never fired and copying
    // guids that match nothing answered 200 with an empty list rather than saying so. Sibling
    // providers check the length, which is the intent.
    if (!events || events.length === 0) {
      throw new NotFoundException();
    }

    const newEvents = events.map((event) => {
      delete event.speakers;
      delete event.broadcast;
      delete event.location;
      delete event.courseCredit;
      delete event.sponsors;
      // A copy is judged afresh (#3183): open, with judges chosen from its own speakers.
      delete event.judges;
      delete event.judgingClosed;
      delete event.guid;
      delete event.created;
      delete event.updated;

      const newEvent = this.eventRepo.create({
        ...event,
        day: season.days[0]
      });

      return newEvent.save();
    });

    try {
      return Promise.all(newEvents);
    } catch (err) {
      rethrowHttp(err, new InternalServerErrorException('Could not copy events into season'));
    }
  }
}

/**
 * The judging fields of a session's save (#3183), checked, as the event to be saved carries them: the competition, none or
 * one of `JUDGED_COMPETITIONS`; whether judging is closed; and the judges, each among `speakers`, the session's speakers as
 * saved with it (the API refuses any other). A field not sent is left out, so it stays as it was.
 */
export function judgingOf(
  event: Pick<UpdateEventDto, 'judgedCompetition' | 'judgingClosed' | 'judges'>,
  speakers: Array<string>
) {
  const judging: DeepPartial<Event> = {};

  if (event.judgedCompetition !== undefined) {
    const problem = judgedCompetitionProblem(event.judgedCompetition);

    if (problem) {
      throw new BadRequestException(problem);
    }

    judging.judgedCompetition = event.judgedCompetition || null;
  }

  if (event.judgingClosed !== undefined) {
    if (typeof event.judgingClosed !== 'boolean') {
      throw new BadRequestException('Judging closed is true or false.');
    }

    judging.judgingClosed = event.judgingClosed;
  }

  if (event.judges !== undefined) {
    if (!Array.isArray(event.judges) || event.judges.some((j) => typeof j !== 'string')) {
      throw new BadRequestException('Name the judges by their ids.');
    }

    if (event.judges.some((j) => !speakers.includes(j))) {
      throw new BadRequestException("A judge must be one of the session's speakers.");
    }

    judging.judges = [...new Set(event.judges)].map((guid) => ({ guid }) as Speaker);
  }

  return judging;
}

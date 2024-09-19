import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, groupBy, mergeMap, toArray } from 'rxjs';
import { DeepPartial, In, Repository } from 'typeorm';

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
import { BaseProvider } from '../_base/base-provider';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventAttendanceDto } from './dto/event-attendance.dto';
import { SeasonService } from '../season/season.service';
import { ActiveSeasonDto } from '../season/dto/active-season.dto';

@Injectable()
export class EventProvider extends BaseProvider<Event> {
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

  public async getEvents(seasonGuid?: string) {
    try {
      let season: ActiveSeasonDto | Season;

      if (seasonGuid) {
        season = await this.seasonProvider.findOne({
          where: {
            guid: seasonGuid
          }
        });
      } else {
        season = await this.seasonProvider.findOneActive();
      }

      if (season) {
        const [s] = await this.seasonRepo
          .createQueryBuilder('season')
          .leftJoinAndSelect('season.days', 'day')
          .leftJoinAndSelect('day.events', 'event')
          .leftJoinAndSelect('event.day', 'eventDay')
          .leftJoinAndSelect('event.location', 'location')
          .where('season.guid = :guid', { guid: season.guid })
          .orderBy('day.date', 'ASC')
          .addOrderBy('event.startTime', 'ASC')
          .getMany();

        return s.days.map((day) => day.events).flat();
      } else {
        return this.eventRepo.find({
          relations: EntityRelationsLUT.getRelation('event'),
          order: {
            startTime: 'ASC'
          }
        });
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
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

      const eventEnt = this.eventRepo.create(newEvent);

      if (eventEnt) {
        return eventEnt.save();
      }
    } catch (error) {
      throw new UnprocessableEntityException(null, 'Could not insert new Event');
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

      const tags = event.tags.map((t) => {
        return this.tagRepo.create({ guid: t });
      });
      const speakers = event.speakers.map((t) => this.speakerRepo.create({ guid: t }));

      const newEnt = this.eventRepo.create({
        ...existingEvent,
        ...event,
        tags,
        speakers
      });

      return newEnt.save();
    } catch (error) {
      throw new UnprocessableEntityException(null, 'Could not insert new Event');
    }
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
      return this.userRsvpRepo.count({
        where: {
          event
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
      select: ['observedAttendeeStart', 'observedAttendeeEnd', 'guid']
    });

    if (!event) {
      throw new NotFoundException();
    }

    return event;
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

    if (!events) {
      throw new NotFoundException();
    }

    const newEvents = events.map((event) => {
      delete event.speakers;
      delete event.broadcast;
      delete event.location;
      delete event.courseCredit;
      delete event.sponsors;
      delete event.guid;

      const newEvent = this.eventRepo.create({
        ...event,
        day: season.days[0]
      });

      return newEvent.save();
    });

    try {
      return Promise.all(newEvents);
    } catch (err) {
      throw new InternalServerErrorException('Could not copy events into season');
    }
  }

  public deleteEvents(guidOrEventGuids: string) {
    const eventGuidsArray = guidOrEventGuids.split(',');

    if (eventGuidsArray.length === 0) {
      throw new UnprocessableEntityException(null, 'No event guids provided');
    }

    try {
      return this.deleteEntities(eventGuidsArray);
    } catch (err) {
      throw new InternalServerErrorException('Could not delete events');
    }
  }
}

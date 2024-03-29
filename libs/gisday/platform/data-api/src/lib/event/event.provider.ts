import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { from, groupBy, mergeMap, toArray } from 'rxjs';
import { DeepPartial, In, Repository } from 'typeorm';

import {
  EntityRelationsLUT,
  Event,
  EventBroadcast,
  EventLocation,
  Speaker,
  Sponsor,
  Tag,
  UserRsvp
} from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventAttendanceDto } from './dto/event-attendance.dto';

@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(
    @InjectRepository(Event) public eventRepo: Repository<Event>,
    @InjectRepository(EventLocation) private eventLocationRepo: Repository<EventLocation>,
    @InjectRepository(EventBroadcast) private eventBroadcastRepo: Repository<EventBroadcast>,
    @InjectRepository(Speaker) private speakerRepo: Repository<Speaker>,
    @InjectRepository(Tag) private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Sponsor) private sponsorRepo: Repository<Sponsor>,
    @InjectRepository(UserRsvp) private userRsvpRepo: Repository<UserRsvp>
  ) {
    super(eventRepo);
  }

  public getEvents() {
    return this.find({
      relations: EntityRelationsLUT.getRelation('event')
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
}

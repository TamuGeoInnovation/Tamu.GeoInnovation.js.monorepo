import { Injectable, UnprocessableEntityException } from '@nestjs/common';
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

  public async insertEvent(_newEvent: DeepPartial<Event>) {
    try {
      const newEvent: DeepPartial<Event> = {
        ..._newEvent
      };

      const broadcastEnt = this.eventBroadcastRepo.create(_newEvent.broadcast);
      const locationEnt = this.eventLocationRepo.create(_newEvent.location);

      const existingSpeakers = await this.speakerRepo.find({
        where: {
          guid: In(_newEvent.speakers)
        }
      });

      const existingTags = await this.tagRepo.find({
        where: {
          guid: In(_newEvent.tags)
        }
      });

      newEvent.broadcast = broadcastEnt;
      newEvent.location = locationEnt;
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

  public async updateEvent(_newEvent: DeepPartial<Event>) {
    try {
      const newEvent: DeepPartial<Event> = {
        ..._newEvent
      };

      const broadcastEnt = this.eventBroadcastRepo.create(_newEvent.broadcast);
      const locationEnt = this.eventLocationRepo.create(_newEvent.location);

      const existingSpeakers = await this.speakerRepo.find({
        where: {
          guid: In(_newEvent.speakers)
        }
      });

      const existingTags = await this.tagRepo.find({
        where: {
          guid: In(_newEvent.tags)
        }
      });

      newEvent.broadcast = broadcastEnt;
      newEvent.location = locationEnt;
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

  private async getTags(_tagGuids: string[]): Promise<Tag[]> {
    return this.tagRepo.find({
      guid: In(_tagGuids)
    });
  }

  private async getSponsors(_sponsorsGuids: string[]): Promise<Sponsor[]> {
    return this.sponsorRepo.find({
      guid: In(_sponsorsGuids)
    });
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
}

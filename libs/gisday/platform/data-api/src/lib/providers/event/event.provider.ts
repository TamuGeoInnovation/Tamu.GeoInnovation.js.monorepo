import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { from, groupBy, mergeMap, of, reduce, tap, toArray } from 'rxjs';

import { DeepPartial, In } from 'typeorm';

import {
  Event,
  EventBroadcastRepo,
  EventLocationRepo,
  EventRepo,
  SpeakerRepo,
  Sponsor,
  SponsorRepo,
  Tag,
  TagRepo,
  UserRsvpRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(
    private readonly eventRepo: EventRepo,
    private readonly eventLocationRepo: EventLocationRepo,
    private readonly eventBroadcastRepo: EventBroadcastRepo,
    private readonly speakerRepo: SpeakerRepo,
    private readonly tagRepo: TagRepo,
    private readonly sponsorRepo: SponsorRepo,
    private readonly userRsvpRepo: UserRsvpRepo
  ) {
    super(eventRepo, 'event');
  }

  public async getEvents() {
    return await this.getEntitiesWithRelations('event');
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

  public async getEntitiesByDayOld(accountGuid?: string) {
    const entities = await this.eventRepo.getAllCurrentSeasonByStartTime();
    // TODO: Update days to reflect those days that GIS Day is held
    // TODO: This whole function needs to be redone probably
    const days = ['15', '16', '17'];
    const newEntities = {};

    if (accountGuid) {
      const usersRsvps = await this.userRsvpRepo.find({
        where: {
          userGuid: accountGuid
        }
      });
      const eventGuids: string[] = await usersRsvps.map((rsvp) => {
        return rsvp.event.guid;
      });
      entities.forEach((entity) => {
        if (eventGuids.includes(entity.guid)) {
          entity.hasRsvp = true;
        }
      });
      days.forEach((day, index) => {
        const dayEvents = entities.filter(() => {
          // const dateString = event.startTime.toISOString();
          // return dateString.indexOf(day) !== -1;
        });
        newEntities[`day${index}`] = dayEvents;
      });
      return newEntities;
    } else {
      days.forEach((day, index) => {
        const dayEvents = entities.filter(() => {
          // const dateString = event.date.toISOString();
          // return dateString.indexOf(day) !== -1;
        });
        newEntities[index] = dayEvents;
      });
      return newEntities;
    }
  }

  public async getEntitiesByDay(accountGuid?: string) {
    const events = this.eventRepo.find();
    const entities = from(events).pipe(
      mergeMap((events) => events),
      groupBy((event) => event.startTime),
      tap((event) => console.log(event))
    );

    // const people = [
    //   { name: 'Sue', age: 25 },
    //   { name: 'Joe', age: 30 },
    //   { name: 'Frank', age: 25 },
    //   { name: 'Sarah', age: 35 }
    // ];
    // //emit each person
    // const source = from(people);
    // //group by age
    // const example = source.pipe(
    //   groupBy((person) => person.age),
    //   // return each item in group as array
    //   mergeMap((group) => group.pipe(toArray())),
    //   toArray()
    // );

    return entities;

    // example.subscribe((result) => {
    //   console.log(result);
    // });

    // TODO: Update days to reflect those days that GIS Day is held
    // TODO: This whole function needs to be redone probably
    // const days = ['15', '16', '17'];
    // const newEntities = {};

    // if (accountGuid) {
    //   const usersRsvps = await this.userRsvpRepo.find({
    //     where: {
    //       userGuid: accountGuid
    //     }
    //   });
    //   const eventGuids: string[] = await usersRsvps.map((rsvp) => {
    //     return rsvp.event.guid;
    //   });
    //   entities.forEach((entity) => {
    //     if (eventGuids.includes(entity.guid)) {
    //       entity.hasRsvp = true;
    //     }
    //   });
    //   days.forEach((day, index) => {
    //     const dayEvents = entities.filter(() => {
    //       // const dateString = event.startTime.toISOString();
    //       // return dateString.indexOf(day) !== -1;
    //     });
    //     newEntities[`day${index}`] = dayEvents;
    //   });
    //   return newEntities;
    // } else {
    //   days.forEach((day, index) => {
    //     const dayEvents = entities.filter(() => {
    //       // const dateString = event.date.toISOString();
    //       // return dateString.indexOf(day) !== -1;
    //     });
    //     newEntities[index] = dayEvents;
    //   });
    //   return newEntities;
    // }
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

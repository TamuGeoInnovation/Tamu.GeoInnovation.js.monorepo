import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Request } from 'express';
import {
  Event,
  EventRepo,
  Session,
  SessionRepo,
  Sponsor,
  SponsorRepo,
  Tag,
  TagRepo,
  UserRsvp,
  UserRsvpRepo
} from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(
    private readonly eventRepo: EventRepo,
    private readonly tagRepo: TagRepo,
    private readonly sessionRepo: SessionRepo,
    private readonly sponsorRepo: SponsorRepo,
    private readonly userRsvpRepo: UserRsvpRepo
  ) {
    super(eventRepo);
  }

  public async insertEvent(req: Request) {
    try {
      const _newEvent: Partial<Event> = {
        ...req.body
      };
      if (req.body.tags) {
        _newEvent.tags = await this.getTags(req.body.tags);
      }
      if (req.body.sponsors) {
        _newEvent.sponsors = await this.getSponsors(req.body.sponsors);
      }
      if (req.body.sessions) {
        _newEvent.sessions = await this.getSessions(req.body.sessions);
      }
      const newEvent = await this.eventRepo.create(_newEvent);
      this.eventRepo.save(newEvent);
    } catch (error) {
      throw new Error('something went wrong inserting new event');
    }
  }

  private async getTags(_tagGuids: string[]): Promise<Tag[]> {
    return this.tagRepo.find({
      guid: In(_tagGuids)
    });
  }

  private async getSessions(_sessionGuids: string[]): Promise<Session[]> {
    return this.sessionRepo.find({
      guid: In(_sessionGuids)
    });
  }

  private async getSponsors(_sponsorsGuids: string[]): Promise<Sponsor[]> {
    return this.sponsorRepo.find({
      guid: In(_sponsorsGuids)
    });
  }

  public async getEntitiesByDay(req: Request) {
    const entities: Event[] = await this.eventRepo
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.tags', 'tags')
      .orderBy('startTime', 'ASC')
      .getMany();
    // TODO: Update days to reflect those days that GIS Day is held
    const days = ['16', '17', '18'];
    const newEntities = {};

    if (req.user) {
      const usersRsvps = await this.userRsvpRepo.find({
        where: {
          userGuid: req.user.sub
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
        const dayEvents = entities.filter((event) => {
          const dateString = event.date.toISOString();
          return dateString.indexOf(day) !== -1;
        });
        newEntities[`day${index}`] = dayEvents;
      });
      return newEntities;
    } else {
      days.forEach((day, index) => {
        const dayEvents = entities.filter((event) => {
          const dateString = event.date.toISOString();
          return dateString.indexOf(day) !== -1;
        });
        newEntities[index] = dayEvents;
      });
      return newEntities;
    }
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

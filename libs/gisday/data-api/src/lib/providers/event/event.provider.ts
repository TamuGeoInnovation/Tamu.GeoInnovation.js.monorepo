import { Injectable } from '@nestjs/common';
import { In } from 'typeorm';
import { Request } from 'express';
import { Event, EventRepo, Tag, TagRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(private readonly eventRepo: EventRepo, private readonly tagRepo: TagRepo) {
    super(eventRepo);
  }

  public async insertEvent(req: Request) {
    try {
      const _newEvent: Partial<Event> = {
        ...req.body
      };
      _newEvent.tags = await this.getTags(req.body.tags);
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

  async getEntitiesByDay() {
    const entities: Event[] = await this.eventRepo
      .createQueryBuilder('events')
      .leftJoinAndSelect('events.tags', 'tags')
      .orderBy('startTime', 'ASC')
      .getMany();
    // TODO: Update days to reflect those days that GIS Day is held
    const days = ['16', '17', '18'];
    const newEntities = {};
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

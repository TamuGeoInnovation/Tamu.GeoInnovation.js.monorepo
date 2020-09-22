import { Injectable } from '@nestjs/common';

import { Event, EventRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(private readonly eventRepo: EventRepo) {
    super(eventRepo);
  }

  async getEntitiesByDay() {
    const entities: Event[] = await this.eventRepo
      .createQueryBuilder('events')
      .orderBy('startTime', 'ASC')
      .getMany();
    // TODO: Update days to reflect those days that GIS Day is held
    const days = ['16', '17', '18'];
    const newEntities = {};
    days.forEach((day, index) => {
      const dayEvents = entities.filter((event) => {
        return event.date.indexOf(day) !== -1;
      });
      newEntities[index] = dayEvents;
    });
    return newEntities;
  }
}

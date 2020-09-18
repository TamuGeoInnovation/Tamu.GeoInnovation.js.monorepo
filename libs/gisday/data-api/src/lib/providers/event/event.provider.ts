import { Injectable } from '@nestjs/common';

import { Event, EventRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';
@Injectable()
export class EventProvider extends BaseProvider<Event> {
  constructor(private readonly eventRepo: EventRepo) {
    super(eventRepo);
  }
}

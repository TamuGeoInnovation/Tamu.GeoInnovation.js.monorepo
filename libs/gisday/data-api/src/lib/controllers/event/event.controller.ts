import { Controller, Get, Param, Post, Request } from '@nestjs/common';

import { Event } from '../../entities/all.entity';
import { EventProvider } from '../../providers/event/event.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('event')
export class EventController extends BaseController<Event> {
  constructor(private readonly eventProvider: EventProvider) {
    super(eventProvider);
  }

  @Get('/:guid/rsvps')
  public async getNumberOfRsvps(@Param() params) {
    return this.eventProvider.getNumberOfRsvps(params.guid);
  }

  @Get('by-day')
  public async getEntitiesByDay(@Request() req) {
    const accountGuid = req.user.sub;
    return this.eventProvider.getEntitiesByDay(accountGuid);
  }

  @Post()
  public async insertEvent(@Request() req) {
    const _newEvent: Partial<Event> = {
      ...req.body
    };
    return this.eventProvider.insertEvent(_newEvent);
  }
}

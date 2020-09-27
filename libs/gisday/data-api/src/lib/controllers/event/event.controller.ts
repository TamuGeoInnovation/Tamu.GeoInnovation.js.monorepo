import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { Event } from '../../entities/all.entity';
import { EventProvider } from '../../providers/event/event.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('event')
export class EventController extends BaseController<Event> {
  constructor(private readonly eventProvider: EventProvider) {
    super(eventProvider);
  }

  @Get('/:guid/rsvps')
  async getNumberOfRsvps(@Param() params) {
    // TODO: We need to use a UserRsvpProvider to search for all RSVPs of this event
    return 0;
    // return this.eventProvider.getNumberOfRsvps(params.guid);
  }

  @Get('by-day')
  async getEntitiesByDay() {
    return this.eventProvider.getEntitiesByDay();
  }

  @Post()
  async insertEvent(@Req() req: Request) {
    return this.eventProvider.insertEvent(req);
  }
}

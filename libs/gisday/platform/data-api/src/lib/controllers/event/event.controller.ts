import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { Event } from '../../entities/all.entity';
import { EventProvider } from '../../providers/event/event.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('event')
export class EventController extends BaseController<Event> {
  constructor(private readonly eventProvider: EventProvider) {
    super(eventProvider, 'event');
  }

  @Get('/all')
  public async getEvents() {
    return this.eventProvider.getEntitiesWithRelations('event');
  }

  @Get('/:guid/rsvps')
  public async getNumberOfRsvps(@Param() params) {
    return this.eventProvider.getNumberOfRsvps(params.guid);
  }

  @Get('by-day')
  public async getEntitiesByDay() {
    return this.eventProvider.getEntitiesByDay();
  }

  @Post()
  public async insertEvent(@Body() body: DeepPartial<Event>) {
    return this.eventProvider.insertEvent(body);
  }

  @Patch()
  public async updateEvent(@Body() body: DeepPartial<Event>) {
    return this.eventProvider.updateEvent(body);
  }
}

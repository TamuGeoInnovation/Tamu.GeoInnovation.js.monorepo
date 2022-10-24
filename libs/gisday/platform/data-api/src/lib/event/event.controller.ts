import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { EntityRelationsLUT, Event } from '../entities/all.entity';
import { EventProvider } from './event.provider';
import { BaseController } from '../_base/base.controller';

@Controller('event')
export class EventController extends BaseController<Event> {
  constructor(private readonly eventProvider: EventProvider) {
    super(eventProvider);
  }

  @Get('/all')
  public async getEvents() {
    return this.eventProvider.eventRepo.find({
      where: {
        season: '2022'
      },
      relations: EntityRelationsLUT.getRelation('event'),
      order: {
        startTime: 'ASC'
      }
    });
  }

  @Get('/:guid')
  public async getDetails(@Param('guid') guid) {
    return this.eventProvider.eventRepo.findOne({
      where: {
        guid
      },
      relations: EntityRelationsLUT.getRelation('event')
    });
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

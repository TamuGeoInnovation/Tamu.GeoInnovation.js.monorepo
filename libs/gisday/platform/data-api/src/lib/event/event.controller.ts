import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { EntityRelationsLUT, Event } from '../entities/all.entity';
import { EventProvider } from './event.provider';

@Controller('events')
export class EventController {
  constructor(private readonly provider: EventProvider) {}

  @Get(':guid/event')
  public async getEntityWithRelations(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('event')
    });
  }

  @Get(':guid/rsvps')
  public async getNumberOfRsvps(@Param() params) {
    return this.provider.getNumberOfRsvps(params.guid);
  }

  @Get('by-day')
  public async getEntitiesByDay() {
    return this.provider.getEntitiesByDay();
  }

  @Get(':guid')
  public async getDetails(@Param('guid') guid) {
    return this.provider.eventRepo.findOne({
      where: {
        guid
      },
      relations: EntityRelationsLUT.getRelation('event')
    });
  }

  @Get()
  public async getEvents() {
    return this.provider.eventRepo.find({
      where: {
        season: '2022'
      },
      relations: EntityRelationsLUT.getRelation('event'),
      order: {
        startTime: 'ASC'
      }
    });
  }

  @Post()
  public async insertEvent(@Body() body: DeepPartial<Event>) {
    return this.provider.insertEvent(body);
  }

  @Patch()
  public async updateEvent(@Body() body: DeepPartial<Event>) {
    return this.provider.updateEvent(body);
  }

  @Delete(':guid')
  public async deleteEvent(@Param() params) {
    return this.provider.deleteEntity(params.guid);
  }
}

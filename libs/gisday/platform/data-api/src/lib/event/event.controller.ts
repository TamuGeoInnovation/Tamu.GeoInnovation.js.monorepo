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

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid, @Body() body: UpdateEventDto) {
    return this.provider.updateEvent(guid, body);
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

export interface UpdateEventDto extends Omit<DeepPartial<Event>, 'tags' | 'speakers'> {
  tags: Array<string>;
  speakers: Array<string>;
}

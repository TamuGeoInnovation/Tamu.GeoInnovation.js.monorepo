import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AllowAny, JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

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

  @UseGuards(JwtGuard)
  @AllowAny()
  @Get(':guid')
  public async getDetails(@Req() req, @Param('guid') guid) {
    return this.provider.getEventDetails(guid, req.user?.sub !== undefined);
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

  @Permissions(['create:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEvent(@Body() body: DeepPartial<Event>) {
    return this.provider.insertEvent(body);
  }

  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid, @Body() body: UpdateEventDto) {
    return this.provider.updateEvent(guid, body);
  }

  @Permissions(['delete:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
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

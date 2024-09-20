import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AllowAny, JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EntityRelationsLUT, Event } from '../entities/all.entity';
import { EventProvider } from './event.provider';
import { EventAttendanceDto } from './dto/event-attendance.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly provider: EventProvider) {}

  @Get('season/:guid')
  public async getEventsForSeason(@Param('guid') seasonGuid) {
    return this.provider.getEventsForSeason(seasonGuid);
  }

  @Get(':guid/attendance')
  public async getAttendance(@Param('guid') guid) {
    return this.provider.getEventAttendance(guid);
  }

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

  @Get('active')
  public async getEventsForActiveSeason() {
    return this.provider.getEventsForActiveSeason();
  }

  @UseGuards(JwtGuard)
  @AllowAny()
  @Get(':guid')
  public async getDetails(@Req() req, @Param('guid') guid) {
    return this.provider.getEventDetails(guid, req.user?.sub !== undefined);
  }

  @Get()
  public async getEvents() {
    return this.provider.getEvents();
  }

  @Permissions(['create:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public async copyEventsIntoSeason(@Body() body: { seasonGuid: string; existingEntityGuids: Array<string> }) {
    return this.provider.copyEventsIntoSeason(body.seasonGuid, body.existingEntityGuids);
  }

  @Permissions(['create:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEvent(@Body() body: DeepPartial<Event>) {
    return this.provider.insertEvent(body);
  }

  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid/attendance')
  public async updateAttendance(@Param('guid') guid, @Body() counts: EventAttendanceDto) {
    if (!counts || (counts.observedAttendeeStart === undefined && counts.observedAttendeeEnd === undefined)) {
      throw new BadRequestException('Invalid request body. Missing start and/or end counts.');
    }

    return this.provider.updateAttendance(guid, counts);
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
    return this.provider.deleteEntities(guid);
  }
}

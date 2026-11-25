import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { map, Observable } from 'rxjs';

import { AllowAny, JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EntityRelationsLUT, Event } from '../entities/all.entity';
import { EventProvider } from './event.provider';
import { EventAttendanceDto } from './dto/event-attendance.dto';
import { EventActiveDto } from './dto/event-active.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { sessionShownTo, sessionsShownTo } from '../_base/hidden-sessions';

@Controller('events')
export class EventController {
  constructor(private readonly provider: EventProvider) {}

  // Signed in or not: an admin's account sees hidden sessions, anyone else does not (#3354).
  @UseGuards(JwtGuard)
  @AllowAny()
  @Get('season/active')
  public async getEventsForActiveSeason(@Req() req) {
    return sessionsShownTo(await this.provider.getEventsForActiveSeason(), req.user);
  }

  // Signed in or not: an admin's account sees hidden sessions, anyone else does not (#3354).
  @UseGuards(JwtGuard)
  @AllowAny()
  @Get('season/:guid')
  public async getEventsForSeason(@Param('guid') seasonGuid: string, @Req() req) {
    return sessionsShownTo(await this.provider.getEventsForSeason(seasonGuid), req.user);
  }

  @Get(':guid/attendance')
  public async getAttendance(@Param('guid') guid) {
    return this.provider.getEventAttendance(guid);
  }

  // Signed in or not: an admin's account sees hidden sessions, anyone else does not (#3354).
  @UseGuards(JwtGuard)
  @AllowAny()
  @Get(':guid/event')
  public async getEntityWithRelations(@Param('guid') guid, @Req() req) {
    const event = await this.provider.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation('event')
    });

    return sessionShownTo(event, req.user);
  }

  /** A session's judging (#3183) for its admin form: its competition, whether closed, and its judges by id. */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid/judging')
  public async getJudging(@Param('guid') guid: string) {
    return this.provider.getJudging(guid);
  }

  @Get(':guid/rsvps')
  public async getNumberOfRsvps(@Param() params) {
    return this.provider.getNumberOfRsvps(params.guid);
  }

  // Signed in or not: an admin's account sees hidden sessions, anyone else does not (#3354).
  @UseGuards(JwtGuard)
  @AllowAny()
  @Get('by-day')
  public async getEntitiesByDay(@Req() req) {
    const days: Observable<Array<Array<Event>>> = await this.provider.getEntitiesByDay();

    return days.pipe(map((byDay) => byDay.map((day) => sessionsShownTo(day, req.user)).filter((day) => day.length > 0)));
  }

  @UseGuards(JwtGuard)
  @AllowAny()
  @Get(':guid')
  public async getDetails(@Req() req, @Param('guid') guid) {
    // Hidden from anyone but an admin, whose session edit page reads it (#3354).
    return sessionShownTo(await this.provider.getEventDetails(guid, req.user?.sub !== undefined), req.user);
  }

  // Signed in or not: an admin's account sees hidden sessions, anyone else does not (#3354).
  @UseGuards(JwtGuard)
  @AllowAny()
  @Get()
  public async getEvents(@Req() req) {
    return sessionsShownTo(await this.provider.getEvents(), req.user);
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

  /**
   * Puts events on the public schedule, or takes them off it, from the admin Events list (#2092). Declared
   * before `:guid` so that "active" is not taken for an event's guid.
   */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch('active')
  public async setActive(@Body() body: EventActiveDto) {
    return this.provider.setActive(body?.guids, body?.active);
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

  @Permissions(['delete:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public deleteMany(@Body('guid') guid: string) {
    return this.provider.deleteEntities(guid);
  }
}

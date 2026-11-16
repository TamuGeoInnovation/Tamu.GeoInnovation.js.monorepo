import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EventBroadcast } from '../entities/all.entity';
import { EventBroadcastService } from './event-broadcast.service';

@Controller('event-broadcasts')
export class EventBroadcastController {
  constructor(private readonly ebs: EventBroadcastService) {}

  /**
   * The broadcast reads are for admins only (#3054): they answered anyone with every Zoom's presenter link and join
   * details, which the site shows only to signed-in visitors, on a session's page. Only admin pages read them.
   */
  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/active')
  public async getEventsForActiveSeason() {
    return this.ebs.getBroadcastsForActiveSeason();
  }

  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:guid')
  public async getBroadcastsForSeason(@Param('guid') seasonGuid) {
    return this.ebs.getBroadcastsForSeason(seasonGuid);
  }

  /**
   * The sessions that use a broadcast, for its admin page (#3032). For admins only, as editing the broadcast is: it lists
   * sessions hidden from the public schedule too.
   */
  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid/sessions')
  public async getSessions(@Param('guid') guid: string) {
    return this.ebs.getSessions(guid);
  }

  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    // With its place (#3048), which its admin page shows and saves.
    return this.ebs.findOne({
      where: {
        guid: guid
      },
      relations: { place: true }
    });
  }

  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get()
  public async getEntities() {
    return this.ebs.getEntities();
  }

  @Permissions(['create:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public async copyBroadcastsIntoSeason(@Body() body: { seasonGuid: string; existingEntityGuids: Array<string> }) {
    return this.ebs.copyBroadcastsIntoSeason(body.seasonGuid, body.existingEntityGuids);
  }

  @Permissions(['create:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: Partial<EventBroadcast>) {
    return this.ebs.create(body);
  }

  @Permissions(['update:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: Partial<EventBroadcast>) {
    return this.ebs.update(guid, body);
  }

  @Permissions(['delete:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.ebs.deleteEntities(guid);
  }

  @Permissions(['delete:event-broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public deleteMany(@Body('guid') guid: string) {
    return this.ebs.deleteEntities(guid);
  }
}

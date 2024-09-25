import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EventLocation } from '../entities/all.entity';
import { EventLocationService } from './event-location.service';

@Controller('event-locations')
export class EventLocationController {
  constructor(private readonly ebs: EventLocationService) {}

  @Get('season/:guid')
  public async getEventLocationsForSeason(@Param('guid') seasonGuid: string) {
    return this.ebs.getEventLocationsForSeason(seasonGuid);
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.ebs.findOne({
      where: {
        guid: guid
      },
      relations: ['place']
    });
  }

  @Get()
  public async getEntities() {
    return this.ebs.getEntities();
  }

  @Permissions(['create:event-locations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('clone')
  public async copy(@Body() body: { seasonGuid: string; existingEntityGuids: Array<string> }) {
    return this.ebs.copyEventLocationsIntoSeason(body.seasonGuid, body.existingEntityGuids);
  }

  @Permissions(['create:event-locations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: Partial<EventLocation>) {
    return this.ebs.create(body);
  }

  @Permissions(['update:event-locations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: Partial<EventLocation>) {
    return this.ebs.update(guid, body);
  }

  @Permissions(['delete:event-locations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.ebs.deleteEntities(guid);
  }

  @Permissions(['delete:event-locations'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public deleteMany(@Body('guid') guid: string) {
    return this.ebs.deleteEntities(guid);
  }
}

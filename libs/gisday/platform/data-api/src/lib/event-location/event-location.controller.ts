import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EventLocation } from '../entities/all.entity';
import { EventLocationService } from './event-location.service';

@Controller('event-locations')
export class EventLocationController {
  constructor(private readonly ebs: EventLocationService) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.ebs.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getEntities() {
    return this.ebs.getEntities();
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
    return this.ebs.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

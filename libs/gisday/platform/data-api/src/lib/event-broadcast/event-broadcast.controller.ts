import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EventBroadcast } from '../entities/all.entity';
import { EventBroadcastService } from './event-broadcast.service';

@Controller('event-broadcasts')
export class EventBroadcastController {
  constructor(private readonly ebs: EventBroadcastService) {}

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
    return this.ebs.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

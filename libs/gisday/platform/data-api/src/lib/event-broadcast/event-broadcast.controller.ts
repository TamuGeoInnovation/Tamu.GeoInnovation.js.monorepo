import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { EventBroadcast } from '../entities/all.entity';
import { EventBroadcastService } from './event-broadcast.service';

@Controller('event-broadcast')
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
    return this.ebs.getBroadcasts();
  }

  @Permissions(['create:broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() broadcast: Partial<EventBroadcast>) {
    return this.ebs.create(broadcast);
  }

  @Permissions(['update:broadcasts'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() broadcast: Partial<EventBroadcast>) {
    return this.ebs.update(guid, broadcast);
  }

  @Permissions(['delete:broadcasts'])
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

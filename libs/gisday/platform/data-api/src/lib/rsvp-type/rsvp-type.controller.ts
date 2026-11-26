import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { type DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { RsvpType } from '../entities/all.entity';
import { RsvpTypeProvider } from './rsvp-type.provider';

@Controller('rsvp-types')
export class RsvpTypeController {
  constructor(private readonly provider: RsvpTypeProvider) {}

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  // An RSVP type is part of how events take registrations, so it is changed by whoever can change events (#3635).
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: DeepPartial<RsvpType>) {
    return this.provider.create(body);
  }

  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<RsvpType>) {
    return this.provider.update(guid, body);
  }

  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntities(guid);
  }
}

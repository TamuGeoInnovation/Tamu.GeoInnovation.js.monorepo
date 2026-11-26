import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { type DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SubmissionType } from '../entities/all.entity';
import { SubmissionTypeProvider } from './submission-type.provider';

@Controller('submission-types')
export class SubmissionTypeController {
  constructor(private readonly provider: SubmissionTypeProvider) {}

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

  // A submission type is part of how the competitions take entries, so it is changed by whoever can change
  // competitions (#3635).
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: DeepPartial<SubmissionType>) {
    return this.provider.create(body);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<SubmissionType>) {
    return this.provider.update(guid, body);
  }

  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    return this.provider.deleteEntities(guid);
  }
}

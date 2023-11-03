import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { University } from '../entities/all.entity';
import { UniversityProvider } from './university.provider';

@Controller('universities')
export class UniversityController {
  constructor(private readonly provider: UniversityProvider) {}

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
    return this.provider.find({
      order: {
        name: 'ASC'
      }
    });
  }

  @Permissions(['create:universities'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public async insertEntity(@Body() body: DeepPartial<University>) {
    return this.provider.create(body);
  }

  @Permissions(['update:universities'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<University>) {
    return this.provider.update(guid, body);
  }

  @Permissions(['delete:universities'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

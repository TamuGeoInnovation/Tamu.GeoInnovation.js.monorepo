import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

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
    return this.provider.find();
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<University>) {
    return this.provider.create(body);
  }

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<University>) {
    return this.provider.update(guid, body);
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

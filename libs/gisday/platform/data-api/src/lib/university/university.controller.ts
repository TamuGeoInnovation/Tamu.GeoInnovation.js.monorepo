import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
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
    throw new NotImplementedException();
  }

  @Patch()
  public async updateEntity(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    throw new NotImplementedException();
  }
}

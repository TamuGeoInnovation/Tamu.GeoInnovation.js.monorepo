import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Sponsor } from '../entities/all.entity';
import { SponsorProvider } from './sponsor.provider';

@Controller('sponsors')
export class SponsorController {
  constructor(private readonly provider: SponsorProvider) {}

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
  public async insertEntity(@Body() body: DeepPartial<Sponsor>) {
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

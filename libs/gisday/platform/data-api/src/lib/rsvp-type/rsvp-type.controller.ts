import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { RsvpTypeProvider } from './rsvp-type.provider';
import { RsvpType } from '../entities/all.entity';

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

  @Post()
  public async insertEntity(@Body() body: DeepPartial<RsvpType>) {
    throw new NotImplementedException();
  }

  @Patch()
  public async updateEntity(@Body() body) {
    throw new NotImplementedException();
  }

  @Delete()
  public async deleteEntity(@Body('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

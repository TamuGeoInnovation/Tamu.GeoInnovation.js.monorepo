import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { SubmissionType } from '../entities/all.entity';
import { SubmissionTypeProvider } from './submission-type.provider';

@Controller('submission-types')
export class SubmissionTypeController {
  constructor(private readonly provider: SubmissionTypeProvider) {}

  @Get()
  public async getEntities() {
    return this.provider.find();
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<SubmissionType>) {
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

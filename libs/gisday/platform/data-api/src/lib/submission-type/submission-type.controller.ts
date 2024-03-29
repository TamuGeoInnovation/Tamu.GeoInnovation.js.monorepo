import { Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';

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

  @Post()
  public async insertEntity() {
    throw new NotImplementedException();
  }

  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
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

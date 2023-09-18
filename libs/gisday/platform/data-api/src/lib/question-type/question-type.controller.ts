import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { QuestionTypeProvider } from './question-type.provider';
import { QuestionType } from '../entities/all.entity';

@Controller('question-types')
export class QuestionTypeController {
  constructor(private readonly provider: QuestionTypeProvider) {}

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
  public async insertEntity(@Body() body: DeepPartial<QuestionType>) {
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

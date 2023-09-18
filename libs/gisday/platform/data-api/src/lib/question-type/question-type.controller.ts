import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { QuestionTypeProvider } from './question-type.provider';
import { QuestionType } from '../entities/all.entity';

@Controller('question-types')
export class QuestionTypeController {
  constructor(private readonly provider: QuestionTypeProvider) {}

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
  public async insertEntity(@Body() body: DeepPartial<QuestionType>) {
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

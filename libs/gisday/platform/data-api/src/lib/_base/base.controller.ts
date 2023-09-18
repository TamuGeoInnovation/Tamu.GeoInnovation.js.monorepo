import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial, FindConditions } from 'typeorm';

import { EntityRelationsLUT } from '../entities/all.entity';
import { BaseProvider } from './base-provider';

@Controller()
export abstract class BaseController<T> {
  constructor(private readonly provider: BaseProvider<T>) {}

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

  // ONLY FOR SPEAKERS AND EVENTS
  @Get(':guid/:entity')
  public async getEntityWithRelations(@Param('guid') guid, @Param('entity') entity) {
    return this.provider.findOne({
      where: {
        guid: guid
      },
      relations: EntityRelationsLUT.getRelation(entity)
    });
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<T>) {
    return this.provider.save(body);
  }

  @Patch()
  public async updateEntity(@Body() body) {
    const conditions: FindConditions<T> = {};
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    return this.provider.deleteEntity(params.guid);
  }
}

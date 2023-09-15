import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial, FindConditions } from 'typeorm';

import { EntityRelationsLUT } from '../entities/all.entity';
import { BaseProvider } from './base-provider';

@Controller()
export abstract class BaseController<T> {
  constructor(private readonly provider: BaseProvider<T>) {}

  @Get('/all')
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
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.save(body);
  }

  @Patch()
  public async updateEntity(@Body() body) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    const conditions: FindConditions<T> = {};
    return;
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.deleteEntity(params.guid);
  }
}

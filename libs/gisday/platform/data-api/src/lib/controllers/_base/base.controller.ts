import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { EntityName } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Controller()
export abstract class BaseController<T> {
  private entityName: EntityName;

  constructor(private readonly provider: BaseProvider<T>, entityName?: EntityName) {
    this.entityName = entityName;
  }

  @Get('/all')
  public async getEntities() {
    return this.provider.getEntities();
  }

  @Get(':guid')
  public async getEntity(@Param() params) {
    return this.provider.getEntity(params.guid);
  }

  @Get(':guid/deep')
  public async getEntityWithRelations(@Param() params) {
    return this.provider.getEntityWithRelations(params.guid, this.entityName);
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<T>) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.insertEntity(body);
  }

  @Patch()
  public async updateEntity(@Body() body: DeepPartial<T>) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.updateEntity(body, this.entityName);
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.deleteEntity(params.guid);
  }
}

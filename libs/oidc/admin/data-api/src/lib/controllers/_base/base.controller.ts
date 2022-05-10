import { Body, Controller, Delete, Get, NotImplementedException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { AuthorizationGuard } from '../../guards/authorization.guard';
import { BaseService } from '../../services/_base/base.service';

@Controller()
@UseGuards(AuthorizationGuard)
export abstract class BaseController<T> {
  constructor(private readonly provider: BaseService<T>) {}

  @Get('/all')
  public async getEntities() {
    return this.provider.getEntities();
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.getEntity(guid);
  }

  @Post()
  public async insertEntity(@Body() body: DeepPartial<T>) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.insertEntity(body);
  }

  @Patch()
  public async updateEntity() {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return new NotImplementedException();
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    // TODO: Add AuthGuard here: libs\gisday\platform\data-api\src\lib\guards\auth.guard.ts
    return this.provider.deleteEntity(params.guid);
  }
}

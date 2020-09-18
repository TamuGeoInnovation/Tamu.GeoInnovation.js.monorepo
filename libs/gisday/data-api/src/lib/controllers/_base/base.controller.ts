import { Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';

import { BaseProvider } from '../../providers/_base/base-provider';

@Controller()
export abstract class BaseController<T> implements IBaseController<T> {
  constructor(private readonly provider: BaseProvider<T>) {}
  @Get('/all')
  public async getEntities() {
    return this.provider.getEntities();
  }

  @Get(':guid')
  public async getEntity(@Param() params) {
    return this.provider.getEntity(params.guid);
  }

  @Post()
  public async insertEntity(@Req() req: Request) {
    return this.provider.insertEntity(req);
  }

  @Patch()
  public async updateEntity(@Req() req) {
    return this.provider.updateEntity(req);
  }

  @Delete(':guid')
  public async deleteEntity(@Param() params) {
    return this.provider.deleteEntity(params.guid);
  }
}

export interface IBaseController<T> {
  getEntity(guid: string): Promise<T>;
  getEntities(): Promise<T[]>;
  insertEntity(req: Request): Promise<T>;
  updateEntity(req: Request): Promise<T>;
  deleteEntity(guid: string): Promise<T>;
}

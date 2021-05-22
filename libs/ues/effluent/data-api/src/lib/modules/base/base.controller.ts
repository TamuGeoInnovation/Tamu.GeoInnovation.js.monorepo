import { Controller, Get, Param, Post, Body, Delete, Patch } from '@nestjs/common';
import { BaseEntity, DeepPartial } from 'typeorm';

import { BaseService } from './base.service';

@Controller('base')
export class BaseController<T extends BaseEntity> {
  constructor(private s: BaseService<T>) {}

  @Get('')
  public getAll() {
    return this.s.getAll();
  }

  @Get(':id')
  public getOne(@Param() params) {
    return this.s.getOne({
      where: {
        guid: params.id
      }
    });
  }

  @Post('')
  public insert(@Body() body: DeepPartial<T>) {
    if (body) {
      return this.s.createOne(body);
    }
  }

  @Patch(':id')
  public update(@Param() params, @Body() body: DeepPartial<T>) {
    if (params && body) {
      return this.s.updateOne({ where: { guid: params.id } }, body);
    } else {
      throw new Error('Input parameter missing');
    }
  }

  @Delete(':id')
  public delete(@Param() params) {
    if (params) {
      return this.s.deleteOne({ where: { guid: params.id } });
    } else {
      throw new Error('Input parameter missing');
    }
  }
}

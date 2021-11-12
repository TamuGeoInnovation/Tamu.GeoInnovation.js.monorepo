import { Controller, Get, Param, Post, Body, BadRequestException } from '@nestjs/common';
import { BaseEntity, DeepPartial } from 'typeorm';

import { BaseService } from './base.service';

@Controller()
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
  public async insert(@Body() body: DeepPartial<T>) {
    if (body) {
      const existing = await this.s.getOne({ where: { ...body } });

      if (existing) {
        throw new BadRequestException();
      }

      return this.s.createOne(body);
    }
  }
}

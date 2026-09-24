import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { BaseEntity, DeepPartial, FindOptionsWhere } from 'typeorm';

import { JwtGuard } from '@tamu-gisc/oidc/common';

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
    // TypeORM types `where` as FindOptionsWhere<T>, which will not accept an arbitrary key
    // for an unconstrained generic T. Cast rather than constrain the class generic, which
    // would ripple to every controller extending this one.
    return this.s.getOne({
      where: {
        guid: params.id
      } as FindOptionsWhere<T>
    });
  }

  @UseGuards(JwtGuard)
  @Post('')
  public insert(@Body() body: DeepPartial<T>) {
    if (body) {
      return this.s.createOne(body);
    }
  }
}

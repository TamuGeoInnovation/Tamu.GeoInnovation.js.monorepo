import { Controller, Get, Param } from '@nestjs/common';
import { BaseEntity } from 'typeorm';

import { BaseService } from './base.service';

@Controller()
export abstract class BaseController<Entity extends BaseEntity> {
  constructor(private readonly s: BaseService<Entity>) {}

  @Get()
  public getAll() {
    return this.s.getAll();
  }

  @Get(':id')
  public getMatching(@Param() id) {
    return this.s.getMany();
  }
}

import { Controller, Get } from '@nestjs/common';
import { BaseEntity } from 'typeorm';

import { BaseService } from './base.service';

@Controller()
export class BaseController<T extends BaseEntity> {
  constructor(private s: BaseService<T>) {}

  @Get('')
  public getAll() {
    return this.s.getAll();
  }
}

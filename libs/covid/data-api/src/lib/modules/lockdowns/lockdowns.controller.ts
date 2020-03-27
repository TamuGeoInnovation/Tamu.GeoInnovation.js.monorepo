import { Controller } from '@nestjs/common';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { BaseController } from '../base/base.controller';

@Controller('lockdowns')
export class LockdownsController extends BaseController<Lockdown> {
  constructor(private service: LockdownsService) {
    super(service);
  }
}

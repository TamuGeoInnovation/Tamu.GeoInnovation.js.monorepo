import { Controller } from '@nestjs/common';

import { Workshops } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshops> {
  constructor(private service: WorkshopsService) {
    super(service);
  }
}

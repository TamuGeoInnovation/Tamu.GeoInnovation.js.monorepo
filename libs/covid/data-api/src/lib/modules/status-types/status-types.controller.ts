import { Controller } from '@nestjs/common';

import { StatusType } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { StatusTypesService } from './status-types.service';

@Controller('status-types')
export class StatusTypesController extends BaseController<StatusType> {
  constructor(private service: StatusTypesService) {
    super(service);
  }
}

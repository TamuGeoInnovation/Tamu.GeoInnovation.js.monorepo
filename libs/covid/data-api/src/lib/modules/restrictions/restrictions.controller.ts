import { Controller } from '@nestjs/common';

import { Restriction } from '@tamu-gisc/covid/common/entities';

import { RestrictionsService } from './restrictions.service';
import { BaseController } from '../base/base.controller';

@Controller('restrictions')
export class RestrictionsController extends BaseController<Restriction> {
  constructor(public service: RestrictionsService) {
    super(service);
  }
}

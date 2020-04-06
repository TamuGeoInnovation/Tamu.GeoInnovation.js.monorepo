import { Controller } from '@nestjs/common';

import { RestrictionType } from '@tamu-gisc/covid/common/entities';

import { RestrictionsService } from './restrictions.service';
import { BaseController } from '../base/base.controller';

@Controller('restrictions')
export class RestrictionsController extends BaseController<RestrictionType> {
  constructor(public service: RestrictionsService) {
    super(service);
  }
}

import { Controller } from '@nestjs/common';

import { WebsiteType } from '@tamu-gisc/covid/common/entities';

import { WebsiteTypesService } from './website-types.service';
import { BaseController } from '../base/base.controller';

@Controller('website-types')
export class WebsiteTypesController extends BaseController<WebsiteType> {
  constructor(public service: WebsiteTypesService) {
    super(service);
  }
}

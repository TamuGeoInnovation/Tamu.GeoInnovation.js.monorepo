import { Controller } from '@nestjs/common';

import { SiteService } from '@tamu-gisc/covid/common/entities';

import { SiteServicesService } from './site-services.service';
import { BaseController } from '../base/base.controller';

@Controller('site-services')
export class SiteServicesController extends BaseController<SiteService> {
  constructor(private service: SiteServicesService) {
    super(service);
  }
}

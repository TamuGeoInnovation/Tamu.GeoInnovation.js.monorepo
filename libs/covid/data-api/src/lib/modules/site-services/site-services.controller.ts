import { Controller } from '@nestjs/common';

import { SiteServiceType } from '@tamu-gisc/covid/common/entities';

import { SiteServicesService } from './site-services.service';
import { BaseController } from '../base/base.controller';

@Controller('site-services')
export class SiteServicesController extends BaseController<SiteServiceType> {
  constructor(private service: SiteServicesService) {
    super(service);
  }
}

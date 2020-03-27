import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController extends BaseController<TestingSite> {
  constructor(private service: SitesService) {
    super(service);
  }
}

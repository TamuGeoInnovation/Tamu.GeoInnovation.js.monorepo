import { Controller } from '@nestjs/common';

import { Sites } from '@tamu-gisc/two/common';

import { BaseController } from '../base/base.controller';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController extends BaseController<Sites> {
  constructor(private readonly service: SitesService) {
    super(service, {
      getMatching: {
        id: 'siteId'
      }
    });
  }
}

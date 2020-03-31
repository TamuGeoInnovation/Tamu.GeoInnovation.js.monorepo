import { Controller } from '@nestjs/common';

import { SiteOwner } from '@tamu-gisc/covid/common/entities';

import { SiteOwnersService } from './site-owners.service';
import { BaseController } from '../base/base.controller';

@Controller('site-owners')
export class SiteOwnersController extends BaseController<SiteOwner> {
  constructor(private service: SiteOwnersService) {
    super(service);
  }
}

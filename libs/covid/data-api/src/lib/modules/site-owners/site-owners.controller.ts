import { Controller } from '@nestjs/common';

import { SiteOwnerType } from '@tamu-gisc/covid/common/entities';

import { SiteOwnersService } from './site-owners.service';
import { BaseController } from '../base/base.controller';

@Controller('site-owners')
export class SiteOwnersController extends BaseController<SiteOwnerType> {
  constructor(private service: SiteOwnersService) {
    super(service);
  }
}

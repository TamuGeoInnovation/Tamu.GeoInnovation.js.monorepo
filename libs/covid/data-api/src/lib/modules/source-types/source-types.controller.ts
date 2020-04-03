import { Controller } from '@nestjs/common';

import { WebsiteType } from '@tamu-gisc/covid/common/entities';

import { SourceTypesService } from './source-types.service';
import { BaseController } from '../base/base.controller';

@Controller('source-types')
export class SourceTypesController extends BaseController<WebsiteType> {
  constructor(public service: SourceTypesService) {
    super(service);
  }
}

import { Controller } from '@nestjs/common';

import { FieldType } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { FieldTypesService } from './field-types.service';

@Controller('field-types')
export class FieldTypesController extends BaseController<FieldType> {
  constructor(private service: FieldTypesService) {
    super(service);
  }
}

import { Controller } from '@nestjs/common';

import { Fields } from '@tamu-gisc/two/common';

import { BaseController } from '../base/base.controller';
import { FieldsService } from './fields.service';

@Controller('fields')
export class FieldsController extends BaseController<Fields> {
  constructor(private readonly service: FieldsService) {
    super(service, {
      getMatching: {
        id: 'tableId'
      }
    });
  }
}

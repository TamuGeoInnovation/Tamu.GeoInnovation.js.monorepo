import { Controller } from '@nestjs/common';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { CategoryValuesService } from './category-values.service';

@Controller('field-values')
export class CategoryValuesController extends BaseController<CategoryValue> {
  constructor(private service: CategoryValuesService) {
    super(service);
  }
}

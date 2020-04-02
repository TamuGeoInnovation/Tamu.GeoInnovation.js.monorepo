import { Controller } from '@nestjs/common';

import { PhoneNumberType } from '@tamu-gisc/covid/common/entities';

import { PhoneNumberTypesService } from './phone-number-types.service';
import { BaseController } from '../base/base.controller';

@Controller('phone-number-types')
export class PhoneNumberTypesController extends BaseController<PhoneNumberType> {
  constructor(private service: PhoneNumberTypesService) {
    super(service);
  }
}

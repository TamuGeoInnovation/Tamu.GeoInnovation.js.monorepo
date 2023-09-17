import { Controller } from '@nestjs/common';

import { University } from '../entities/all.entity';
import { UniversityProvider } from './university.provider';
import { BaseController } from '../_base/base.controller';

@Controller('universities')
export class UniversityController extends BaseController<University> {
  constructor(private readonly universityProvider: UniversityProvider) {
    super(universityProvider);
  }
}

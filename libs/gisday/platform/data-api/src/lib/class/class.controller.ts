import { Controller } from '@nestjs/common';

import { Class } from '../entities/all.entity';
import { ClassProvider } from './class.provider';
import { BaseController } from '../_base/base.controller';

@Controller('classes')
export class ClassController extends BaseController<Class> {
  constructor(private readonly classProvider: ClassProvider) {
    super(classProvider);
  }
}

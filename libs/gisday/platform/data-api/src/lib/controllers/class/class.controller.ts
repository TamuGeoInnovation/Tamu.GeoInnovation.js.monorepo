import { Controller } from '@nestjs/common';

import { Class } from '../../entities/all.entity';
import { ClassProvider } from '../../providers/class/class.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('class')
export class ClassController extends BaseController<Class> {
  constructor(private readonly classProvider: ClassProvider) {
    super(classProvider);
  }
}

import { Injectable } from '@nestjs/common';

import { Class, ClassRepo } from '../../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class ClassProvider extends BaseProvider<Class> {
  constructor(private readonly classRepo: ClassRepo) {
    super(classRepo);
  }
}

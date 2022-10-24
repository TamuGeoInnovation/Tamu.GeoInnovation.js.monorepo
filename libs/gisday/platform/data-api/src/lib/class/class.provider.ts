import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Class } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class ClassProvider extends BaseProvider<Class> {
  constructor(@InjectRepository(Class) private classRepo: Repository<Class>) {
    super(classRepo);
  }
}

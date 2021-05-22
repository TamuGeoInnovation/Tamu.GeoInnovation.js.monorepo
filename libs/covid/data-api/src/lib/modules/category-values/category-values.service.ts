import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CategoryValuesService extends BaseService<CategoryValue> {
  constructor(@InjectRepository(CategoryValue) private repo: Repository<CategoryValue>) {
    super(repo);
  }
}

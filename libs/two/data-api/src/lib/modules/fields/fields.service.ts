import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Fields } from '@tamu-gisc/two/common';

import { BaseService } from '../base/base.service';

@Injectable()
export class FieldsService extends BaseService<Fields> {
  constructor(@InjectRepository(Fields) private readonly repository: Repository<Fields>) {
    super(repository);
  }
}

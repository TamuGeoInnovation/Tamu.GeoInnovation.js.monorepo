import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroupFlds } from '@tamu-gisc/two/common';

import { BaseService } from '../base/base.service';

@Injectable()
export class DataGroupFieldsService extends BaseService<DataGroupFlds> {
  constructor(@InjectRepository(DataGroupFlds) private readonly repository: Repository<DataGroupFlds>) {
    super(repository);
  }
}

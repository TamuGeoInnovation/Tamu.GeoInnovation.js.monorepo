import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class FieldTypesService extends BaseService<FieldType> {
  constructor(@InjectRepository(FieldType) private repo: Repository<FieldType>) {
    super(repo);
  }
}

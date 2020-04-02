import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SourceType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SourceTypesService extends BaseService<SourceType> {
  constructor(@InjectRepository(SourceType) public repo: Repository<SourceType>) {
    super(repo);
  }
}

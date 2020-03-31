import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Classification } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SourceTypesService extends BaseService<Classification> {
  constructor(@InjectRepository(Classification) public repo: Repository<Classification>) {
    super(repo);
  }
}

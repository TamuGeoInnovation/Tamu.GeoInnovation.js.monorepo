import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RestrictionType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class RestrictionsService extends BaseService<RestrictionType> {
  constructor(@InjectRepository(RestrictionType) repo: Repository<RestrictionType>) {
    super(repo);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Scenarios } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ScenariosService extends BaseService<Scenarios> {
  constructor(@InjectRepository(Scenarios) private repo: Repository<Scenarios>) {
    super(repo);
  }
}

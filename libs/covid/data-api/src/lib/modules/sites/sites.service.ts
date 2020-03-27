import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TestingSite } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SitesService extends BaseService<TestingSite> {
  constructor(@InjectRepository(TestingSite) private repo: Repository<TestingSite>) {
    super(repo);
  }
}

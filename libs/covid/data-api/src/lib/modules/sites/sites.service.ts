import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TestingSite, ValidatedTestingSite } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SitesService extends BaseService<TestingSite> {
  constructor(
    @InjectRepository(TestingSite) public repo: Repository<TestingSite>,
    @InjectRepository(ValidatedTestingSite) public validatedRepo: Repository<ValidatedTestingSite>
  ) {
    super(repo);
  }
}

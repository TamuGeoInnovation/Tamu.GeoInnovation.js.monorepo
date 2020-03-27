import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lockdown, ValidatedLockdown } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(
    @InjectRepository(Lockdown) public repo: Repository<Lockdown>,
    @InjectRepository(ValidatedLockdown) public validatedRepo: Repository<ValidatedLockdown>
  ) {
    super(repo);
  }
}

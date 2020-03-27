import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(@InjectRepository(Lockdown) repo: Repository<Lockdown>) {
    super(repo);
  }
}

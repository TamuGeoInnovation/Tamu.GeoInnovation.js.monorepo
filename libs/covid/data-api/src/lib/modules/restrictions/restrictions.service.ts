import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restriction } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class RestrictionsService extends BaseService<Restriction> {
  constructor(@InjectRepository(Restriction) repo: Repository<Restriction>) {
    super(repo);
  }
}

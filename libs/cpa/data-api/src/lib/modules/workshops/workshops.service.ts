import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Workshops } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WorkshopsService extends BaseService<Workshops> {
  constructor(@InjectRepository(Workshops) private repo: Repository<Workshops>) {
    super(repo);
  }
}

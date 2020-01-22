import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Responses } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ResponsesService extends BaseService<Responses> {
  constructor(@InjectRepository(Responses) private repo: Repository<Responses>) {
    super(repo);
  }
}

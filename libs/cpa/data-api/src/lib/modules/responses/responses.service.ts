import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ResponsesService extends BaseService<Response> {
  constructor(@InjectRepository(Response) private repo: Repository<Response>) {
    super(repo);
  }
}

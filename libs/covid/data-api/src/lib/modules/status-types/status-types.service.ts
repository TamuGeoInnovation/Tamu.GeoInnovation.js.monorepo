import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StatusType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class StatusTypesService extends BaseService<StatusType> {
  constructor(@InjectRepository(StatusType) private repo: Repository<StatusType>) {
    super(repo);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteStatusType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteStatusesService extends BaseService<SiteStatusType> {
  constructor(@InjectRepository(SiteStatusType) public repo: Repository<SiteStatusType>) {
    super(repo);
  }
}

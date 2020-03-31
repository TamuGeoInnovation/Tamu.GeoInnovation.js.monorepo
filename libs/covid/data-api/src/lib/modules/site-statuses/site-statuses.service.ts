import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteStatus } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteStatusesService extends BaseService<SiteStatus> {
  constructor(@InjectRepository(SiteStatus) public repo: Repository<SiteStatus>) {
    super(repo);
  }
}

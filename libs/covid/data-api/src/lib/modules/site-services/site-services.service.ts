import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteService } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteServicesService extends BaseService<SiteService> {
  constructor(@InjectRepository(SiteService) public repo: Repository<SiteService>) {
    super(repo);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteServiceType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteServicesService extends BaseService<SiteServiceType> {
  constructor(@InjectRepository(SiteServiceType) public repo: Repository<SiteServiceType>) {
    super(repo);
  }
}

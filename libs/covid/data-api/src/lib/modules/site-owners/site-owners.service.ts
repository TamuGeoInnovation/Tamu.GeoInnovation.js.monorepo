import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteOwnerType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteOwnersService extends BaseService<SiteOwnerType> {
  constructor(@InjectRepository(SiteOwnerType) public repo: Repository<SiteOwnerType>) {
    super(repo);
  }
}

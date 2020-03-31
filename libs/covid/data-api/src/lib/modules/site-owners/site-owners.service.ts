import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SiteOwner } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SiteOwnersService extends BaseService<SiteOwner> {
  constructor(@InjectRepository(SiteOwner) public repo: Repository<SiteOwner>) {
    super(repo);
  }
}

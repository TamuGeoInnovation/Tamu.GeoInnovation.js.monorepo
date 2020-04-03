import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WebsiteType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SourceTypesService extends BaseService<WebsiteType> {
  constructor(@InjectRepository(WebsiteType) public repo: Repository<WebsiteType>) {
    super(repo);
  }
}

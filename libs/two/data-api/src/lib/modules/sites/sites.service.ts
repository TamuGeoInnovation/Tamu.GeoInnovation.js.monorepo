import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Sites } from '@tamu-gisc/two/common';

import { BaseService } from '../base/base.service';

@Injectable()
export class SitesService extends BaseService<Sites> {
  constructor(
    @InjectRepository(Sites)
    private repository: Repository<Sites>
  ) {
    super(repository);
  }
}

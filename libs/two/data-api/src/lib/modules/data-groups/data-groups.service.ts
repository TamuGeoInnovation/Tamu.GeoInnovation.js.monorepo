import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DataGroups } from '@tamu-gisc/two/common';

import { BaseService } from '../base/base.service';

@Injectable()
export class DataGroupsService extends BaseService<DataGroups> {
  constructor(@InjectRepository(DataGroups) private repository: Repository<DataGroups>) {
    super(repository);
  }
}

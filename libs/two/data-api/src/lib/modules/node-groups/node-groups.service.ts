import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NodeGroups } from '@tamu-gisc/two/common';

import { BaseService } from '../base/base.service';

@Injectable()
export class NodeGroupsService extends BaseService<NodeGroups> {
  constructor(@InjectRepository(NodeGroups) private readonly repository: Repository<NodeGroups>) {
    super(repository);
  }
}

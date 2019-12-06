import { Controller } from '@nestjs/common';

import { NodeGroups } from '@tamu-gisc/two/common';

import { BaseController } from '../base/base.controller';
import { NodeGroupsService } from './node-groups.service';

@Controller('node-groups')
export class NodeGroupsController extends BaseController<NodeGroups> {
  constructor(private readonly service: NodeGroupsService) {
    super(service);
  }
}

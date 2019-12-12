import { Controller } from '@nestjs/common';

import { DataGroups } from '@tamu-gisc/two/common';

import { BaseController } from '../base/base.controller';
import { DataGroupsService } from './data-groups.service';

@Controller('data-groups')
export class DataGroupsController extends BaseController<DataGroups> {
  constructor(private readonly service: DataGroupsService) {
    super(service, {
      getMatching: {
        id: 'node_ID'
      }
    });
  }
}

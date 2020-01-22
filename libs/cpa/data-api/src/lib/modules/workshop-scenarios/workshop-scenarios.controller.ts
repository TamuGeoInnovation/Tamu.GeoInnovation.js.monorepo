import { Controller } from '@nestjs/common';

import { WorkshopScenarios } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopScenariosService } from './workshop-scenarios.service';

@Controller('workshop-scenarios')
export class WorkshopScenariosController extends BaseController<WorkshopScenarios> {
  constructor(private service: WorkshopScenariosService) {
    super(service);
  }
}

import { Controller } from '@nestjs/common';

import { WorkshopScenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { WorkshopScenariosService } from './workshop-scenarios.service';

@Controller('workshop-scenarios')
export class WorkshopScenariosController extends BaseController<WorkshopScenario> {
  constructor(private service: WorkshopScenariosService) {
    super(service);
  }
}

import { Controller } from '@nestjs/common';

import { Scenarios } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenarios> {
  constructor(private service: ScenariosService) {
    super(service);
  }
}

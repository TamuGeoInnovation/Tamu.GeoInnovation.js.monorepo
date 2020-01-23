import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkshopScenario } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WorkshopScenariosService extends BaseService<WorkshopScenario> {
  constructor(@InjectRepository(WorkshopScenario) private repo: Repository<WorkshopScenario>) {
    super(repo);
  }
}

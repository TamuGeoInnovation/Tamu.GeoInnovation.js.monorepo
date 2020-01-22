import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkshopScenarios } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WorkshopScenariosService extends BaseService<WorkshopScenarios> {
  constructor(@InjectRepository(WorkshopScenarios) private repo: Repository<WorkshopScenarios>) {
    super(repo);
  }
}

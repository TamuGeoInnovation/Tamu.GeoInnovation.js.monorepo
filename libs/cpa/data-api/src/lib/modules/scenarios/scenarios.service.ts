import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ScenariosService extends BaseService<Scenario> {
  constructor(@InjectRepository(Scenario) private repo: Repository<Scenario>){
    super(repo);
  }
}

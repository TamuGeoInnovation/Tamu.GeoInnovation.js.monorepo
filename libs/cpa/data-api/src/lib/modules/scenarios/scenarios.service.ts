import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Scenario, Workshop } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class ScenariosService extends BaseService<Scenario> {
  constructor(
    @InjectRepository(Scenario) private scenarioRepo: Repository<Scenario>,
    @InjectRepository(Workshop) private workshopRepo: Repository<Workshop>
  ) {
    super(scenarioRepo);
  }

  /**
   * Returns a list of scenarios for a workshop
   *
   */
  public async getScenariosForWorkshop(workshopGuid: string) {
    return this.scenarioRepo.find({
      where: {
        workshops: workshopGuid
      }
    });
  }

  public async updateScenario(wGuid: string, sGuid: string) {
    const scenario = await this.scenarioRepo.findOne({ where: { guid: sGuid }, relations: ['workshop'] });
    const newWorkshop = await this.workshopRepo.findOne({ where: { guid: wGuid } });

    if (scenario) {
      scenario.workshop = newWorkshop;
      scenario.save();
    }
  }
}

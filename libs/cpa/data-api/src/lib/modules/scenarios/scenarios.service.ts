import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, In, Repository } from 'typeorm';

import { Scenario, Workshop, Response } from '@tamu-gisc/cpa/common/entities';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import { BaseService } from '../base/base.service';
import { IScenariosResponseResolved } from './scenarios.controller';

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
    const workshop = await getRepository(Workshop).findOne({
      where: [
        {
          guid: workshopGuid
        },
        {
          alias: workshopGuid
        }
      ],
      relations: ['scenarios']
    });

    return workshop.scenarios;
  }

  public async updateScenario(wGuid: string, sGuid: string) {
    const scenario = await this.scenarioRepo.findOne({ where: { guid: sGuid }, relations: ['workshop'] });
    const newWorkshop = await this.workshopRepo.findOne({ where: { guid: wGuid } });

    if (scenario) {
      scenario.workshop = newWorkshop;
      return scenario.save();
    }
  }

  public async getGeometryLayersForScenario(scenarioGuid: string): Promise<IScenariosResponseResolved> {
    const scenario = await this.scenarioRepo.findOne({
      where: {
        guid: scenarioGuid
      }
    });

    const responsesFromLayerGuids = await getRepository(Response).find({
      where: {
        guid: In((scenario.layers as unknown) as string[])
      }
    });

    return {
      ...scenario,
      layers: responsesFromLayerGuids.map((r) => {
        return {
          graphics: (r.shapes as unknown) as IGraphic[],
          info: {
            name: r.name,
            description: r.notes,
            type: 'graphics',
            layerId: r.guid
          }
        };
      })
    };
  }
}

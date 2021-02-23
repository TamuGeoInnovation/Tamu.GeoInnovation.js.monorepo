import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, In, Repository } from 'typeorm';

import { Scenario, Workshop, Response, Snapshot } from '@tamu-gisc/cpa/common/entities';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import { BaseService } from '../base/base.service';
import { IScenariosResponse, IScenariosResponseResolved } from './scenarios.controller';

@Injectable()
export class ScenariosService extends BaseService<Scenario> {
  constructor(
    @InjectRepository(Scenario) private scenarioRepo: Repository<Scenario>,
    @InjectRepository(Response) private responseRepo: Repository<Response>,
    @InjectRepository(Snapshot) private snapshotRepo: Repository<Snapshot>
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

  public async updateScenario(scenarioGuid: string, scenarioDetails: IScenariosResponse) {
    const existingScenario = await this.scenarioRepo.findOne({ where: { guid: scenarioGuid } });

    if (existingScenario) {
      // Resolve if the provided layer guid's are of type response or snapshot.
      // The input layer guids will be mapped to an object with a "type" property describing them as such
      const snapLayers = this.snapshotRepo.find({
        where: {
          guid: In(scenarioDetails.layers)
        }
      });

      const respLayers = this.responseRepo.find({
        where: {
          guid: In(scenarioDetails.layers)
        }
      });

      const [resolvedSnapLayers, resolvedRespLayers] = await Promise.all([snapLayers, respLayers]);

      const categorizedLayers = scenarioDetails.layers.map((polyGuid) => {
        let type = '';
        if (resolvedSnapLayers.find((l) => l.guid === polyGuid)) {
          type = 'snapshot';
        } else if (resolvedRespLayers.find((l) => l.guid === polyGuid)) {
          type = 'response';
        }

        return {
          guid: polyGuid,
          type
        };
      });

      // Assert categorized as a string, otherwise `update` method will throw an error due to
      // incompatible types.
      const detailed = { ...scenarioDetails, layers: (categorizedLayers as unknown) as string };

      return this.scenarioRepo.update({ guid: scenarioGuid }, detailed);
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

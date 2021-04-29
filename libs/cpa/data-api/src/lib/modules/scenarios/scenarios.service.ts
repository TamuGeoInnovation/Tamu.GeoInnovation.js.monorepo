import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, In, Repository } from 'typeorm';

import {
  Scenario,
  Workshop,
  Response,
  Snapshot,
  WorkshopScenario,
  CPALayer,
  IScenario,
  LayerReference
} from '@tamu-gisc/cpa/common/entities';
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

    // Resolve the layers for each of the scenarios
    const resolvedScenarios = Promise.all(
      workshop.scenarios.map((s) => this.getGeometryLayersForScenarioRelationship(s.guid))
    );

    return resolvedScenarios;
  }

  public async updateScenario(scenarioGuid: string, scenarioDetails: IScenariosResponse) {
    const existingScenario = await this.scenarioRepo.findOne({ where: { guid: scenarioGuid } });

    // Scenario details layer guid's are mapped into objects with a type attribute describing whether they are of type
    // snapshot or response. If scenario detail layers array is empty, default to this array as a default update value,
    // otherwise, it will be re-assigned with the mapped array.
    let categorizedLayers: Array<LayerReference> = [];

    if (existingScenario) {
      if (scenarioDetails.layers.length > 0) {
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

        const scenLayers = this.scenarioRepo.find({
          where: {
            guid: In(scenarioDetails.layers)
          }
        });

        const [resolvedSnapLayers, resolvedRespLayers, resolvedScenLayers] = await Promise.all([
          snapLayers,
          respLayers,
          scenLayers
        ]);

        categorizedLayers = scenarioDetails.layers.map((polyGuid) => {
          let type = '';
          if (resolvedSnapLayers.find((l) => l.guid === polyGuid)) {
            type = 'snapshot';
          } else if (resolvedRespLayers.find((l) => l.guid === polyGuid)) {
            type = 'response';
          } else if (resolvedScenLayers.find((l) => l.guid === polyGuid)) {
            type = 'scenario';
          }

          return {
            guid: polyGuid,
            type
          } as LayerReference;
        });
      }

      // Assert categorized as a string, otherwise `update` method will throw an error due to
      // incompatible types.
      const detailed = { ...scenarioDetails, layers: categorizedLayers };

      return this.scenarioRepo.update({ guid: scenarioGuid }, detailed);
    }
  }

  public async getGeometryLayersForScenarioRelationship(
    workshopScenarioRelationshipGuid: string
  ): Promise<IScenariosResponseResolved> {
    const relation = await getRepository(WorkshopScenario).findOne({
      where: {
        guid: workshopScenarioRelationshipGuid
      },
      relations: ['scenario']
    });

    return this.getGeometryLayersForScenario(relation.scenario);
  }

  /**
   * Retrieves the inner geometry layers for a workshop scenario relationship guid.
   *
   * @param {string} workshopScenarioRelationshipGuid The guid of the `workshopScenario` relationship. A secondary query will be
   * run to get the actual scenario entity.
   * @return {*}  {Promise<IScenariosResponseResolved>}
   */
  public async getGeometryLayersForScenario(scenario: string | IScenario): Promise<IScenariosResponseResolved> {
    let scen: IScenario;

    if (typeof scenario === 'string') {
      scen = await this.scenarioRepo.findOne({ where: { guid: scenario } });
    } else {
      scen = scenario;
    }

    if (scen.layers.length === 0) {
      const mappedScenario = { ...scen, layers: [] };
      return mappedScenario as IScenariosResponseResolved;
    } else {
      // Separate the scenario layers into types and map out the guid to query for all of them.
      const responseLayersGuids = scen.layers.filter((l) => l.type === 'response').map((r) => r.guid);
      const snapshotLayersGuids = scen.layers.filter((l) => l.type === 'snapshot').map((r) => r.guid);
      const scenarioLayersGuids = scen.layers.filter((l) => l.type === 'scenario').map((r) => r.guid);

      // Because the queries fail if any of the above arrays are empty due to invalid `In(<empty array>)`,
      // we have to only run the queries for which the respective entity array has a length greater than 0.
      const queries = [];

      if (responseLayersGuids.length > 0) {
        queries.push(
          this.responseRepo.find({
            relations: ['snapshot', 'scenario'],
            where: {
              guid: In(responseLayersGuids)
            }
          })
        );
      }

      if (snapshotLayersGuids.length > 0) {
        queries.push(
          this.snapshotRepo.find({
            where: {
              guid: In(snapshotLayersGuids)
            }
          })
        );
      }

      if (scenarioLayersGuids.length > 0) {
        queries.push(
          this.scenarioRepo.find({
            where: {
              guid: In(scenarioLayersGuids)
            },
            relations: ['responses']
          })
        );
      }

      const resolvedLayers = await Promise.all(queries);

      // resolvedLayers resolves into an array containing arrays.
      // Need to spread the inner arrays to avoid deep nesting iterations.
      const flattened = resolvedLayers.flat();

      // Order the resolved layers so that they match the original order specified by the scenario.
      // This is because the queries for both snapshots and responses are not guaranteed to be in the
      // original order.
      //
      // After that, map each depending on the type to the correct format used by the front-end.
      const orderedResolved: IScenariosResponseResolved['layers'] = scen.layers
        .map((layerMeta) => {
          return flattened.find((respOrSnap) => layerMeta.guid === respOrSnap.guid);
        })
        .map((resolved) => {
          if (resolved instanceof Response) {
            const responseType = this.getResponseType(resolved);
            return {
              graphics: (resolved.shapes as unknown) as IGraphic[],
              info: {
                name: `${resolved.name} (Response - ${responseType})`,
                description: resolved.notes,
                type: 'graphics',
                layerId: resolved.guid
              }
            };
          } else if (resolved instanceof Snapshot) {
            return {
              layers: (resolved.layers as unknown) as Array<CPALayer>,
              info: {
                name: `${resolved.title} (Snapshot)`,
                description: resolved.description,
                type: 'group',
                layerId: resolved.guid
              }
            };
          } else if (resolved instanceof Scenario) {
            return {
              graphics: resolved.responses.reduce((acc, curr) => {
                return [...acc, ...((curr.shapes as unknown) as IGraphic[])];
              }, []),
              info: {
                name: `${resolved.title} (Scenario)`,
                description: resolved.description,
                type: 'graphics',
                layerId: resolved.guid
              }
            };
          }
        });

      // Shallow copy the properties from the original scenario and overwrite the layers with the resolved,
      // ordered, and mapped array.
      const detailedScenario: IScenariosResponseResolved = { ...scen, layers: orderedResolved };

      return detailedScenario;
    }
  }

  private getResponseType(response: Response) {
    if (response.hasOwnProperty('snapshot')) {
      return 'Snapshot';
    } else if (response.hasOwnProperty('scenario')) {
      return 'Scenario';
    } else {
      return;
    }
  }
}

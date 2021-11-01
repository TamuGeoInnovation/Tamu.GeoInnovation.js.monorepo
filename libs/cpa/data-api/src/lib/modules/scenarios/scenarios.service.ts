import { Injectable, NotFoundException } from '@nestjs/common';
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
import { IScenarioPartial, IScenarioSimplified, IScenarioResolved } from './scenarios.controller';

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

  public async updateScenario(scenarioGuid: string, scenarioDetails: IScenarioPartial) {
    const existingScenario = await this.scenarioRepo.findOne({ where: { guid: scenarioGuid } });

    if (existingScenario) {
      return this.scenarioRepo.update({ guid: scenarioGuid }, scenarioDetails);
    } else {
      throw new NotFoundException();
    }
  }

  public async getGeometryLayersForScenarioRelationship(
    workshopScenarioRelationshipGuid: string
  ): Promise<IScenarioResolved> {
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
  public async getGeometryLayersForScenario(scenario: string | IScenario): Promise<IScenarioResolved> {
    let scen: IScenario;

    if (typeof scenario === 'string') {
      scen = await this.scenarioRepo.findOne({ where: { guid: scenario } });
    } else {
      scen = scenario;
    }

    if (scen.layers.length === 0) {
      const mappedScenario = { ...scen, layers: [] };
      return mappedScenario as IScenarioResolved;
    } else {
      // Separate the scenario layers into types and map out the guid to query for all of them.
      const responseLayersGuids = scen.layers.filter((l) => l.type === 'response').map((r) => r.guid);
      const snapshotLayersGuids = scen.layers.filter((l) => l.type === 'snapshot').map((r) => r.guid);
      const scenarioLayersGuids = scen.layers.filter((l) => l.type === 'scenario').map((r) => r.guid);
      const snapshotResponseLayersGuids = scen.layers.filter((l) => l.type === 'snapshot-responses').map((r) => r.guid);

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

      if (snapshotResponseLayersGuids.length > 0) {
        queries.push(
          this.snapshotRepo.find({
            where: {
              guid: In(snapshotResponseLayersGuids)
            },
            relations: ['responses', 'responses.participant']
          })
        );
      }

      const resolvedLayers = await Promise.all(queries);

      // resolvedLayers resolves into an array containing arrays.
      // Need to spread the inner arrays to avoid deep nested iterations.
      const flattened = resolvedLayers.flat();

      // Even though we added response, snapshot, scenario, and snapshot response queries in order, we don't have a guarantee that there were
      // four queries total sent every time, meaning we can't use array destructuring to assign categories.
      //
      // Because of it, we have to group each layer type into categories again. This is specifically done so we can
      // apply the correct layer generation strategy.
      const groupedLayers: {
        responses: Response[];
        snapshots: Snapshot[];
        scenarios: Scenario[];
        snapshotResponses: Snapshot[];
      } = flattened.reduce(
        (acc, curr) => {
          if (curr instanceof Response) {
            acc.responses.push(curr);
          } else if (curr instanceof Snapshot && curr.responses === undefined) {
            // Both regular snapshot and snapshot response layers are of the same type but they don't have the same relationships available.
            // In addition to checking if it's of type snapshot, the current layer guid must not be found in the list of snapshot response layer guid's.
            acc.snapshots.push(curr);
          } else if (curr instanceof Scenario) {
            acc.scenarios.push(curr);
          } else if (curr instanceof Snapshot && curr.responses !== undefined) {
            acc.snapshotResponses.push(curr);
          }

          return acc;
        },
        { responses: [], snapshots: [], scenarios: [], snapshotResponses: [] }
      );

      // Group responses by snapshot/scenarios. Each group will be one group layer and each
      // response will be a graphics sub-layer
      const responseGroupLayers: GroupedResponsesDictionary = groupedLayers.responses.reduce((acc, curr) => {
        if (curr.snapshot) {
          if (!acc[curr.snapshot.guid]) {
            acc[curr.snapshot.guid] = [];
          }

          acc[curr.snapshot.guid].push(curr);
        } else if (curr.scenario) {
          if (!acc[curr.scenario.guid]) {
            acc[curr.scenario.guid] = [];
          }

          acc[curr.scenario.guid].push(curr);
        }

        return acc;
      }, {});

      const constructedResponseLayers: CPALayer[] = Object.entries(responseGroupLayers).map(
        ([key, responses]): CPALayer => {
          const entity = responses[0].snapshot ? responses[0].snapshot : responses[0].scenario;

          return {
            info: {
              name: `${entity.title} (Responses)`,
              description: entity.description,
              type: 'group',
              layerId: entity.guid
            },
            layers: responses.map((response) => {
              return {
                graphics: (response.shapes as unknown) as IGraphic[],
                info: {
                  name: response.name ?? 'Anonymous',
                  description: response.notes,
                  type: 'graphics',
                  layerId: response.guid
                }
              };
            })
          };
        }
      );

      const constructedSnapshotLayers = groupedLayers.snapshots.map((snap) => {
        return {
          layers: (snap.layers as unknown) as Array<CPALayer>,
          info: {
            name: `${snap.title} (Snapshot)`,
            description: snap.description,
            type: 'group',
            layerId: snap.guid
          }
        } as CPALayer;
      });

      const constructedScenarioLayers = groupedLayers.scenarios.map((s) => {
        return {
          layers: s.responses.map((response) => {
            return {
              graphics: (response.shapes as unknown) as IGraphic[],
              info: {
                name: response.name ?? 'Anonymous',
                description: response.notes,
                type: 'graphics',
                layerId: response.guid
              }
            };
          }),
          info: {
            name: `${s.title} (Scenario Responses)`,
            description: s.description,
            type: 'group',
            layerId: s.guid
          }
        } as CPALayer;
      });

      const constructedSnapshotResponseLayers = groupedLayers.snapshotResponses.map((s) => {
        return {
          layers: s.responses.map((response) => {
            return {
              graphics: (response.shapes as unknown) as IGraphic[],
              info: {
                name: response?.participant?.name ? response?.participant?.name : 'Unknown Participant',
                type: 'graphics',
                layerId: response.guid
              }
            };
          }),
          info: {
            name: `${s.title} (Snapshot Responses)`,
            description: `Participant responses from the ${s.title} snapshot layer.`,
            type: 'group',
            layerId: s.guid
          }
        } as CPALayer;
      });

      // Shallow copy the properties from the original scenario and overwrite the layers with the resolved,
      // ordered, and mapped array.
      const detailedScenario: IScenarioResolved = {
        ...scen,
        layers: [
          ...constructedSnapshotLayers,
          ...constructedResponseLayers,
          ...constructedScenarioLayers,
          ...constructedSnapshotResponseLayers
        ]
      };

      return detailedScenario;
    }
  }
}
interface GroupedResponsesDictionary {
  [snapOrScenGuid: string]: Response[];
}

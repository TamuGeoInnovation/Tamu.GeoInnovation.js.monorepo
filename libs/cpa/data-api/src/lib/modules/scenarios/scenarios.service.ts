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
import { IScenarioSimplified, IScenariosResponseResolved } from './scenarios.controller';

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

  public async updateScenario(scenarioGuid: string, scenarioDetails: IScenarioSimplified) {
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
      // Need to spread the inner arrays to avoid deep nested iterations.
      const flattened = resolvedLayers.flat();

      // Even though we added response, snapshot,and scenario queries in order, we don't have a guarantee that there were
      // three queries total sent every time meaning we can't use array destructuring to assign categories.
      //
      // Because of it, we have to group each layer type into categories again. This is specifically done so we can
      // group any responses by scenario or snapshot.
      const groupedLayers: { responses: Response[]; snapshots: Snapshot[]; scenarios: Scenario[] } = flattened.reduce(
        (acc, curr) => {
          if (curr instanceof Response) {
            acc.responses.push(curr);
          } else if (curr instanceof Snapshot) {
            acc.snapshots.push(curr);
          } else if (curr instanceof Scenario) {
            acc.scenarios.push(curr);
          }

          return acc;
        },
        { responses: [], snapshots: [], scenarios: [] }
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

      const constructedScenarioLayers = groupedLayers.scenarios.map((scen) => {
        return {
          layers: scen.responses.map((response) => {
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
            name: `${scen.title} (Scenario Responses)`,
            description: scen.description,
            type: 'group',
            layerId: scen.guid
          }
        } as CPALayer;
      });

      // Shallow copy the properties from the original scenario and overwrite the layers with the resolved,
      // ordered, and mapped array.
      const detailedScenario: IScenariosResponseResolved = {
        ...scen,
        layers: [...constructedScenarioLayers, ...constructedResponseLayers, ...constructedSnapshotLayers]
      };

      return detailedScenario;
    }
  }
}
interface GroupedResponsesDictionary {
  [snapOrScenGuid: string]: Response[];
}

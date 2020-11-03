import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Response, Scenario } from '@tamu-gisc/cpa/common/entities';

import esri = __esri;

@Injectable()
export class LayersService {
  constructor(@InjectRepository(Response) private responseRepo: Repository<Response>) {}

  public async getLayersForWorkshop(workshopGuid: string): Promise<Array<Scenario>> {
    const q = await this.responseRepo
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w', {
        w: workshopGuid
      })
      .leftJoinAndSelect('r.scenario', 'scenario')
      .getMany();

    const uniqueSnapshots: Array<Scenario> = q.reduce((acc, curr) => {
      const existsInUniques = acc.find((scenario) => scenario.guid === curr.scenario.guid);

      if (existsInUniques === undefined) {
        return [...acc, curr.scenario];
      } else {
        return acc;
      }
    }, []);

    return uniqueSnapshots;
  }

  public async getResponsesForWorkshopAndScenario(workshop: string, scenario: string) {
    const q = await this.responseRepo
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w')
      .andWhere('r.scenarioGuid = :s')
      .setParameters({ w: workshop, s: scenario })
      .getMany();

    const features = q.map((response) => {
      const graphic = response.shapes as esri.Graphic;
      const geom = graphic.geometry as IBasicGeometry;

      if (geom.rings) {
        geom.type = 'polygon';

        delete graphic.symbol;
      }

      return graphic;
    });

    return q.map((response) => response.shapes);
  }
}

interface IBasicGeometry {
  rings?: object;
  type: string;
}

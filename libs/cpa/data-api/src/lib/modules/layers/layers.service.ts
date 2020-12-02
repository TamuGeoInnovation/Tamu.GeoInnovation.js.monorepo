import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Response, Snapshot } from '@tamu-gisc/cpa/common/entities';

import esri = __esri;

@Injectable()
export class LayersService {
  constructor(@InjectRepository(Response) private responseRepo: Repository<Response>) {}

  public async getLayersForWorkshop(workshopGuid: string): Promise<Array<Snapshot>> {
    const q = await this.responseRepo
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w', {
        w: workshopGuid
      })
      .leftJoinAndSelect('r.snapshot', 'snapshot')
      .getMany();

    const uniqueSnapshots: Array<Snapshot> = q.reduce((acc, curr) => {
      const existsInUniques = acc.find((snapshot) => snapshot.guid === curr.snapshot.guid);

      if (existsInUniques === undefined) {
        return [...acc, curr.snapshot];
      } else {
        return acc;
      }
    }, []);

    return uniqueSnapshots;
  }

  public async getResponsesForWorkshopAndSnapshot(workshop: string, snapshot: string) {
    const q = await this.responseRepo
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w')
      .andWhere('r.snapshotGuid = :s')
      .setParameters({ w: workshop, s: snapshot })
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

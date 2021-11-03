import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { getRepository, Repository } from 'typeorm';

import { Snapshot, Workshop } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { ISnapshotPartial } from './snapshots.controller';

@Injectable()
export class SnapshotsService extends BaseService<Snapshot> {
  constructor(@InjectRepository(Snapshot) private repo: Repository<Snapshot>) {
    super(repo);
  }

  public async updateSnapshot(params: ISnapshotPartial, body: ISnapshotPartial) {
    return await this.repo.update({ guid: params.guid }, { ...body });
  }

  public async deleteSnapshot(params: ISnapshotPartial) {
    return await this.repo.delete({ guid: params.guid });
  }

  public async createSnapshotCopy(donorSnapshotGuid: string) {
    const existing = await this.repo.findOne({ guid: donorSnapshotGuid });

    if (existing) {
      const snapshotCopy = this.repo.create({
        description: existing.description,
        extent: existing.extent,
        isContextual: existing.isContextual,
        layers: existing.layers,
        mapCenter: existing.mapCenter,
        title: `Copy of ${existing.title}`,
        zoom: existing.zoom
      });

      return snapshotCopy.save();
    } else {
      throw new HttpException('Snapshot does not exist.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }

  public async getSnapshotsForWorkshop(workshopGuid: string) {
    const workshop = await getRepository(Workshop).findOne({
      where: [
        {
          guid: workshopGuid
        },
        {
          alias: workshopGuid
        }
      ],
      relations: ['snapshots', 'snapshots.snapshot']
    });

    return workshop.snapshots.map((s) => s.snapshot);
  }

  public async getContextsForWorkshop(workshopGuid: string) {
    const workshop = await getRepository(Workshop).findOne({
      where: [
        {
          guid: workshopGuid
        },
        {
          alias: workshopGuid
        }
      ],
      relations: ['contexts', 'contexts.snapshot']
    });

    return workshop.contexts.map((c) => c.snapshot);
  }

  public getSimplifiedWithWorkshops() {
    return this.repo
      .createQueryBuilder('snapshot')
      .leftJoinAndSelect('snapshot.workshops', 'workshops', 'workshops.workshop IS NOT NULL')
      .leftJoinAndSelect('workshops.workshop', 'workshop')
      .getMany();
  }
}

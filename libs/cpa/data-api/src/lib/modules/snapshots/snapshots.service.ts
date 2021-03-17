import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { getRepository, In, Repository } from 'typeorm';

import { Snapshot, Workshop } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { ISnapshotsRequestPayload } from './snapshots.controller';

@Injectable()
export class SnapshotsService extends BaseService<Snapshot> {
  constructor(@InjectRepository(Snapshot) private repo: Repository<Snapshot>) {
    super(repo);
  }

  public async updateSnapshot(params: ISnapshotsRequestPayload, body: ISnapshotsRequestPayload) {
    return await this.repo.update({ guid: params.guid }, { ...body });
  }

  public async deleteSnapshot(params: ISnapshotsRequestPayload) {
    return await this.repo.delete({ guid: params.guid });
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
}

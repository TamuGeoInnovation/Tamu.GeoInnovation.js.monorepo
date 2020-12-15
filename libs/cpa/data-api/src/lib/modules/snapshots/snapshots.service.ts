import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

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
}

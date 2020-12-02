import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, DeepPartial } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

import { BaseService } from '../base/base.service';

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

export interface ISnapshotsRequestPayload extends DeepPartial<Snapshot> {}

export interface ISnapshotsResponse extends Omit<DeepPartial<Snapshot>, 'layers'> {
  layers: { url: string; info: ILayerConfiguration }[];
}

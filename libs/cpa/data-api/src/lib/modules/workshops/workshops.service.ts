import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, DeepPartial, getRepository } from 'typeorm';

import { Workshop, Snapshot } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WorkshopsService extends BaseService<Workshop> {
  constructor(@InjectRepository(Workshop) private repo: Repository<Workshop>) {
    super(repo);
  }

  public async addNewSnapshot(body: IWorkshopSnapshotPayload) {
    const existing = await this.repository.findOne({ where: { guid: body.workshopGuid }, relations: ['snapshots'] });

    if (existing) {
      // Get the existing snapshot, if it exists.
      const snapshots = await getRepository(Snapshot).findOne({ where: { guid: body.snapshotGuid } });

      existing.snapshots.push(snapshots);

      try {
        return await existing.save();
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async deleteSnapshot(params: IWorkshopSnapshotPayload) {
    const existing = await this.repository.findOne({
      where: { guid: params.workshopGuid },
      relations: ['snapshots']
    });

    if (existing) {
      existing.snapshots = existing.snapshots.filter((s) => s.guid !== params.snapshotGuid);

      return await existing.save();
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async getOne(params) {
    const existing = await this.getOne({ where: { guid: params.guid }, relations: ['snapshots'] });
    if (existing) {
      return existing;
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async updateWorkshop(body: IWorkshopRequestPayload, params) {
    try {
      await this.repo.update({ guid: params.guid }, { ...body });
      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }

  public async deleteWorkshop(params) {
    try {
      await this.repo.delete({ guid: params.guid });
      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }
}

export interface IWorkshopRequestPayload extends DeepPartial<Workshop> {
  guid: string;
}
export interface IWorkshopSnapshotPayload {
  snapshotGuid: string;
  workshopGuid: string;
}

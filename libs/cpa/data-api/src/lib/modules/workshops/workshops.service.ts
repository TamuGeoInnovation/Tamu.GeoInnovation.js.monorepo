import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, getRepository } from 'typeorm';

import { Workshop, Snapshot, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { IWorkshopRequestPayload, IWorkshopScenarioPayload, IWorkshopSnapshotPayload } from './workshops.controller';

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

  public async addNewScenario(body: IWorkshopScenarioPayload) {
    const existing = await this.repository.findOne({ where: { guid: body.workshopGuid }, relations: ['scenarios'] });

    if (existing) {
      // Get the existing snapshot, if it exists.
      const scenarios = await getRepository(Scenario).findOne({ where: { guid: body.scenarioGuid } });

      existing.scenarios.push(scenarios);

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

  public async deleteScenario(params: IWorkshopScenarioPayload) {
    const existing = await this.repository.findOne({
      where: { guid: params.workshopGuid },
      relations: ['scenarios']
    });

    if (existing) {
      existing.scenarios = existing.scenarios.filter((s) => s.guid !== params.scenarioGuid);

      return await existing.save();
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async getWorkshop(params) {
    const existing = await this.getOne({
      where: [{ alias: params.guid }, { guid: params.guid }],
      relations: ['snapshots', 'scenarios']
    });

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

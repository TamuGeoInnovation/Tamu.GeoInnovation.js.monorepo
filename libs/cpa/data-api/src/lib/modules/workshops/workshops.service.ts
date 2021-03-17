import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, getRepository } from 'typeorm';

import { Workshop, Snapshot, Scenario, WorkshopSnapshots } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { IWorkshopRequestPayload, IWorkshopScenarioPayload, IWorkshopSnapshotPayload } from './workshops.controller';

@Injectable()
export class WorkshopsService extends BaseService<Workshop> {
  constructor(@InjectRepository(Workshop) private repo: Repository<Workshop>) {
    super(repo);
  }

  public async addNewSnapshot(body: IWorkshopSnapshotPayload) {
    const existing = await this.getWorkshop(body.workshopGuid, true, false, false);

    if (existing) {
      // Get the existing snapshot, if it exists.
      const snapshot = await getRepository(Snapshot).findOne({ where: { guid: body.snapshotGuid } });

      const snapshotExistsInWorkshop = existing.snapshots.some((s) => s.guid === snapshot.guid);

      if (snapshotExistsInWorkshop === false) {
        const workshopSnapshot = getRepository(WorkshopSnapshots).create({
          snapshot: snapshot,
          workshop: existing
        });

        await workshopSnapshot.save();
      }

      try {
        return await this.getWorkshop(body.workshopGuid, true, false, false);
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
    const existing = await this.getWorkshop(params.workshopGuid, true, false, true);

    if (existing) {
      existing.snapshots = existing.snapshots.filter((s) => s.snapshot.guid !== params.snapshotGuid);

      await existing.save();

      return this.getWorkshop(params.workshopGuid, true, false, false);
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

  public async getWorkshop(
    guid: string,
    snapshots: boolean,
    scenarios: boolean,
    returnMetadata: false
  ): Promise<IWorkshopExtractedSnapshots>;
  public async getWorkshop(guid: string, snapshots: boolean, scenarios: boolean, returnMetadata: true): Promise<Workshop>;
  public async getWorkshop(
    guid: string,
    snapshots: boolean,
    scenarios: boolean,
    returnMetadata: boolean
  ): Promise<ISnapshotsOrWorkshopSnapshots> {
    const queryParams = {
      where: [{ alias: guid }, { guid: guid }],
      relations: []
    };

    if (snapshots) {
      queryParams.relations.push('snapshots');
      queryParams.relations.push('snapshots.snapshot');
    }

    if (scenarios) {
      queryParams.relations.push('scenarios');
    }
    const existing = await this.getOne(queryParams);

    if (existing) {
      // If return meta flag is true, return all workshop snapshot relationship data, otherwise strip out the actual snapshots
      if (returnMetadata) {
        return existing;
      } else {
        const snaps = existing.snapshots.map((s) => s.snapshot);

        return {
          ...existing,
          snapshots: snaps
        } as IWorkshopExtractedSnapshots;
      }
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

export interface IWorkshopExtractedSnapshots extends Omit<Workshop, 'snapshots'> {
  snapshots: Array<Snapshot>;
}

export type ISnapshotsOrWorkshopSnapshots = Workshop | IWorkshopExtractedSnapshots;

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, getRepository } from 'typeorm';

import {
  Workshop,
  Snapshot,
  Scenario,
  WorkshopSnapshot,
  WorkshopScenario,
  WorkshopContext,
  IScenario
} from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';
import { IWorkshopRequestPayload, IWorkshopScenarioPayload, IWorkshopSnapshotPayload } from './workshops.controller';

@Injectable()
export class WorkshopsService extends BaseService<Workshop> {
  constructor(@InjectRepository(Workshop) private repo: Repository<Workshop>) {
    super(repo);
  }

  public async addNewSnapshot(body: IWorkshopSnapshotPayload) {
    const workshop = await this.getWorkshop(body.workshopGuid, true, false, false, false);

    if (workshop) {
      // Quick check to see if the workshop already has the incoming snapshot. We'll skip the adding
      // process if so.
      const snapshot = await getRepository(Snapshot).findOne({ where: { guid: body.snapshotGuid } });

      const workshopHasSnapshot = workshop.snapshots.some((s) => s.guid === snapshot.guid);

      if (workshopHasSnapshot === false) {
        const workshopSnapshot = getRepository(WorkshopSnapshot).create({
          snapshot: snapshot,
          workshop: workshop
        });

        await workshopSnapshot.save();
      }

      try {
        return await this.getWorkshop(body.workshopGuid, true, false, false, false);
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async addNewScenario(body: IWorkshopScenarioPayload) {
    const workshop = await this.getWorkshop(body.workshopGuid, true, true, true, false);

    if (workshop) {
      // Get the existing scenario, if it exists.
      const scenario = await getRepository(Scenario).findOne({ where: { guid: body.scenarioGuid } });

      // Quick check to see if the workshop already has the incoming scenario. We'll skip the adding
      // process if so.
      const workshopHasScenario = workshop.scenarios.some((ws) => ws.guid === scenario.guid);

      if (workshopHasScenario === false) {
        const workshopScenarios = getRepository(WorkshopScenario).create({
          workshop: workshop,
          scenario: scenario
        });

        await workshopScenarios.save();
      }

      try {
        return this.getWorkshop(body.workshopGuid, true, true, true, false);
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async addNewContextSnapshot(body: IWorkshopSnapshotPayload) {
    const workshop = await this.getWorkshop(body.workshopGuid, true, true, true, false);

    if (workshop) {
      // Get the existing contextual snapshot, if it exists.
      const contextualSnap = await getRepository(Snapshot).findOne({ where: { guid: body.snapshotGuid } });

      // Quick check to see if the workshop already has the incoming scenario. We'll skip the adding
      // process if so.
      const workshopHasContext = workshop.scenarios.some((ws) => ws.guid === contextualSnap.guid);

      if (workshopHasContext === false) {
        const workshopContexts = getRepository(WorkshopContext).create({
          workshop: workshop,
          snapshot: contextualSnap
        });

        await workshopContexts.save();
      }

      try {
        return this.getWorkshop(body.workshopGuid, true, true, true, false);
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async removeWorkshopSnapshot(params: IWorkshopSnapshotPayload) {
    const existing = await this.getWorkshop(params.workshopGuid, true, false, false, true);

    if (existing) {
      existing.snapshots = existing.snapshots.filter((s) => s.snapshot.guid !== params.snapshotGuid);

      await existing.save();

      return this.getWorkshop(params.workshopGuid, true, false, false, false);
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async removeWorkshopScenario(params: IWorkshopScenarioPayload) {
    const workshop = await this.getWorkshop(params.workshopGuid, true, true, true, true);

    if (workshop) {
      const relationshipToDelete = workshop.scenarios.find((rel) => rel.scenario.guid === params.scenarioGuid);

      if (relationshipToDelete) {
        await relationshipToDelete.remove();

        return this.getWorkshop(params.workshopGuid, true, true, true, false);
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async removeWorkshopContextSnapshot(params: IWorkshopSnapshotPayload) {
    const existing = await this.getWorkshop(params.workshopGuid, true, true, true, true);

    if (existing) {
      existing.contexts = existing.contexts.filter((s) => s.snapshot.guid !== params.snapshotGuid);

      await existing.save();

      return this.getWorkshop(params.workshopGuid, true, true, true, false);
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  public async getWorkshop(
    guid: string,
    snapshots: boolean,
    scenarios: boolean,
    contexts: boolean,
    returnMetadata: false
  ): Promise<IWorkshopExtractedSnapshots>;
  public async getWorkshop(
    guid: string,
    snapshots: boolean,
    scenarios: boolean,
    contexts: boolean,
    returnMetadata: true
  ): Promise<Workshop>;
  public async getWorkshop(
    guid: string,
    snapshots: boolean,
    scenarios: boolean,
    contexts: boolean,
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
      queryParams.relations.push('scenarios.scenario');
    }

    if (contexts) {
      queryParams.relations.push('contexts');
      queryParams.relations.push('contexts.snapshot');
    }

    const existing = await this.getOne(queryParams);

    if (existing) {
      // If return meta flag is true, return all workshop snapshot relationship data, otherwise strip out the actual snapshots
      if (returnMetadata) {
        return existing;
      } else {
        let snaps: Array<Snapshot>;
        let scens: Array<IScenario>;
        let cntxs: Array<Snapshot>;

        if (snapshots) {
          snaps = existing.snapshots.map((s) => s.snapshot);
        }

        if (scenarios) {
          scens = existing.scenarios.map((s) => s.scenario);
        }

        if (contexts) {
          cntxs = existing.contexts.map((s) => s.snapshot);
        }

        return {
          ...existing,
          snapshots: snaps,
          scenarios: scens,
          contexts: cntxs
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
      const workshop = await this.repo.findOne({ guid: params.guid });

      if (workshop) {
        return workshop.remove();
      } else {
        throw new HttpException('Internal Server Error', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    } catch (err) {
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export interface IWorkshopExtractedSnapshots extends Omit<Workshop, 'snapshots' | 'scenarios' | 'contexts'> {
  snapshots: Array<Snapshot>;
  scenarios: Array<IScenario>;
  contexts: Array<Snapshot>;
}

export type ISnapshotsOrWorkshopSnapshots = Workshop | IWorkshopExtractedSnapshots;

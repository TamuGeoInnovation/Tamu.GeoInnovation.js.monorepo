import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, getRepository } from 'typeorm';

import { Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WorkshopsService extends BaseService<Workshop> {
  constructor(@InjectRepository(Workshop) private repo: Repository<Workshop>) {
    super(repo);
  }
  public async addNewScenario(body: IWorkshopScenarioPayload) {
    const existing = await this.repo.findOne({ where: { guid: body.workshopGuid }, relations: ['scenarios'] });

    if (existing) {
      // Get the existing scenario, if it exists.
      const scenario = await getRepository(Scenario).findOne({ where: { guid: body.scenarioGuid } });

      existing.scenarios.push(scenario);

      try {
        return await existing.save();
      } catch (err) {
        return err;
      }
    } else {
      throw new HttpException('Not Found', 404);
    }
  }
  public async deleteScen(params: IWorkshopScenarioPayload) {
    const existing = await this.repo.findOne({
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
  public async updateWorkshop(body: IWorkshopRequestPayload, params) {
    try {
      await this.repository.update({ guid: params.guid }, { ...body });
      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }
  public async deleteWorkshop(params) {
    try {
      await this.repository.delete({ guid: params.guid });
      return;
    } catch (err) {
      throw new HttpException('Internal Server Error', 500);
    }
  }
}

export interface IWorkshopRequestPayload extends DeepPartial<Workshop> {
  guid: string;
}
export interface IWorkshopScenarioPayload {
  scenarioGuid: string;
  workshopGuid: string;
}

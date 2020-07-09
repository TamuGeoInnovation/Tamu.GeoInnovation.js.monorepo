import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

import { BaseService } from '../base/base.service';

@Injectable()
export class ScenariosService extends BaseService<Scenario> {
  constructor(@InjectRepository(Scenario) private repo: Repository<Scenario>) {
    super(repo);
  }
  public async updateScenario(params: IScenariosRequestPayload, body: IScenariosRequestPayload) {
    return await this.repo.update({ guid: params.guid }, { ...body });
  }
  public async deleteScenario(params: IScenariosRequestPayload) {
    return await this.repo.delete({ guid: params.guid });
  }
}

export interface IScenariosRequestPayload extends DeepPartial<Scenario> {}

export interface IScenariosResponse extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: { url: string; info: ILayerConfiguration }[];
}

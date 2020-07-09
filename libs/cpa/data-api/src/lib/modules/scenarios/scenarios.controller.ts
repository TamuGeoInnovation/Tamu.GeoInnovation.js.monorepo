import { Controller, Patch, Param, Body, Delete } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenario> {
  constructor(private service: ScenariosService) {
    super(service);
  }

  /**
   * Updates an existing scenario
   */
  @Patch(':guid')
  public async update(@Param() params /*: IScenariosRequestPayload*/, @Body() body /*: IScenariosRequestPayload*/) {
    return await this.service.updateScenario(params, body);
    //return await this.service.repository.update({ guid: params.guid }, { ...body });
  }

  /**
   * Deletes an existing scenario
   */
  @Delete(':guid')
  public async delete(@Param() params /*: IScenariosRequestPayload*/) {
    return await this.service.deleteScenario(params);
    //return await this.service.repository.delete({ guid: params.guid });
  }
}

/*export interface IScenariosRequestPayload extends DeepPartial<Scenario> {}

export interface IScenariosResponse extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: { url: string; info: ILayerConfiguration }[];
}*/

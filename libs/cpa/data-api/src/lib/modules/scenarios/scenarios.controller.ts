import { Controller, Patch, Param, Body, Delete } from '@nestjs/common';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';
import { DeepPartial } from 'typeorm';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenario> {
  constructor(private service: ScenariosService) {
    super(service);
  }

  /**
   * Updates an existing scenario
   */
  @Patch(':guid')
  public async update(@Param() params: IScenariosRequestPayload, @Body() body: IScenariosRequestPayload) {
    return await this.service.repository.update({ guid: params.guid }, { ...body });
  }

  /**
   * Deletes an existing scenario
   */
  @Delete(':guid')
  public async delete(@Param() params: IScenariosRequestPayload) {
    return await this.service.repository.delete({ guid: params.guid });
  }
}

export interface IScenariosRequestPayload extends DeepPartial<Scenario> {}

export interface IScenariosResponse extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: { url: string; info: object }[];
}

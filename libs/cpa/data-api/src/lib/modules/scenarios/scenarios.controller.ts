import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenario> {
  constructor(private service: ScenariosService) {
    super(service);
  }

  @Get('workshop/:guid')
  public getScenariosForWorkshop(@Param() params: { guid: string }) {
    return this.service.getScenariosForWorkshop(params.guid);
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
  // layers: { url: string; info: ILayerConfiguration }[];
  layers: IGraphic[];
}

export interface IGraphic {
  geometry: {
    spatialReference: {
      latestWkid: number;
      wkid: number;
    };
    rings: [[]];
  };
  symbol: {
    type: string;
    color: number[];
    width: number;
    outline: {
      type: string;
      color: number[];
      style: string;
      width: number;
    };
    style: string;
  };
  attributes: {};
  popupTemplate: {};
}

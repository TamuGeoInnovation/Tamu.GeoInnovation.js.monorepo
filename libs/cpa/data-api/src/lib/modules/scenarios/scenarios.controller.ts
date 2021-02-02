import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Scenario } from '@tamu-gisc/cpa/common/entities';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import { BaseController } from '../base/base.controller';
import { ScenariosService } from './scenarios.service';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

@Controller('scenarios')
export class ScenariosController extends BaseController<Scenario> {
  constructor(private service: ScenariosService) {
    super(service);
  }

  @Get('workshop/:guid')
  public getScenariosForWorkshop(@Param() params: { guid: string }) {
    return this.service.getScenariosForWorkshop(params.guid);
  }

  @Get()
  public getAll() {
    return this.service.getMany({
      relations: ['workshop']
    });
  }

  @Get(':guid/layer')
  public async getLayerForScenario(@Param() params: { guid: string }) {
    return this.service.getGeometryLayerForScenario(params.guid);
  }

  @Get(':guid')
  public async get(@Param() params) {
    return this.service.getOne({
      where: {
        guid: params.guid
      },
      relations: ['workshop', 'workshop.responses']
    });
  }

  /**
   * Updates an existing scenario
   */
  @Patch(':guid')
  public async update(@Param() params: IScenariosRequestPayload, @Body() body: IScenariosRequestPayload) {
    return await this.service.repository.update({ guid: params.guid }, { ...body });
  }

  @Post('workshop')
  public async updateScenarioPost(@Body() body) {
    return this.service.updateScenario(body.workshopGuid, body.scenarioGuid);
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
  layers: string[];
}

export interface IScenariosResponseResolved extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: Array<{ url?: string; graphics?: Array<IGraphic>; info?: ILayerConfiguration }>;
}

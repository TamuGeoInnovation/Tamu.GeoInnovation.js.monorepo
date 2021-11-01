import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Scenario, CPALayer } from '@tamu-gisc/cpa/common/entities';

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

  @Get()
  public getAll() {
    return this.service.getMany({
      relations: ['workshopScenario', 'workshopScenario.scenario', 'workshopScenario.workshop']
    });
  }

  @Get('rel/:guid/layer')
  public async getLayersForScenarioRelationship(@Param() params: { guid: string }) {
    return this.service.getGeometryLayersForScenarioRelationship(params.guid);
  }

  @Get(':guid/layer')
  public async getLayersForScenario(@Param() params: { guid: string }) {
    return this.service.getGeometryLayersForScenario(params.guid);
  }

  @Get(':guid')
  public async get(@Param() params) {
    const scenario = await this.service.getOne({
      where: {
        guid: params.guid
      },
      relations: ['workshopScenario', 'workshopScenario.scenario', 'workshopScenario.workshop']
    });

    return scenario;
  }

  /**
   * Updates an existing scenario
   */
  @Patch(':guid')
  public async update(@Param() params: Scenario, @Body() body: IScenarioPartial) {
    const result = await this.service.updateScenario(params.guid, body);

    return result;
  }

  /**
   * Deletes an existing scenario
   */
  @Delete(':guid')
  public async delete(@Param() params: Scenario) {
    return await this.service.repository.delete({ guid: params.guid });
  }
}

/**
 * A scenario where layers are instead an array of string guid's, each representing
 * a layer reference.
 */
export interface IScenarioSimplified extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: string[];
}

/**
 * A scenario with every property as optional.
 */
export interface IScenarioPartial extends DeepPartial<Scenario> {}

/**
 * A scenario where layers from references have been resolved.
 */
export interface IScenariosResponseResolved extends Omit<DeepPartial<Scenario>, 'layers'> {
  layers: Array<CPALayer>;
}

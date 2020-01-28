import { Controller, Post, Body, Get, HttpException, Delete, Param, Patch } from '@nestjs/common';
import { getRepository, DeepPartial } from 'typeorm';

import { Response, Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ResponsesService } from './responses.service';

import esri = __esri;

@Controller('responses')
export class ResponsesController extends BaseController<Response> {
  constructor(private service: ResponsesService) {
    super(service);
  }

  @Get(':workshopGuid/:scenarioGuid')
  public async getAllForScenarioAndWorkshop(@Param() params) {
    // const workshop: Workshop = await getRepository(Workshop).findOne({ guid: params.workshopGuid });
    // const scenario: Scenario = await getRepository(Scenario).findOne({ guid: params.scenarioGuid });

    // debugger;

    return this.service.repository.find({ where: { workshopGuid: params.workshopGuid, scenarioGuid: params.scenarioGuid } });
  }

  /**
   * Retrieves a specific existing scenario user response.
   */
  @Get(':guid')
  public async getOne(@Param() params: IResponseRequestPayload) {
    return this.service.getOne({ where: { guid: params.guid }, relations: ['scenario'] });
  }

  /**
   * Updates an existing scenario user response.
   */
  @Patch(':guid')
  public async update(@Param() params: IResponseRequestPayload, @Body() body: IResponseRequestPayload) {
    return this.service.repository.update({ guid: params.guid }, { ...body });
  }

  /**
   * Deletes an existing scenario user response.
   */
  @Delete(':guid')
  public async delete(@Param() params: IResponseRequestPayload) {
    return this.service.repository.delete({ guid: params.guid });
  }

  /**
   * Returns a list of all scenario user responses and its associated scenario.
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['scenario'] });
  }

  /**
   * Inserts a scenario user response.
   */
  @Post('')
  public async insert(@Body() body: IResponseRequestPayload) {
    const workshop = await getRepository(Workshop).findOne({ guid: body.workshopGuid });
    const scenario = await getRepository(Scenario).findOne({ guid: body.scenarioGuid });

    if (workshop && scenario) {
      const entity = { ...body, workshop, scenario };

      return this.service.createOne(entity);
    } else {
      throw new HttpException('Missing resource.', 404);
    }
  }
}

export interface IResponseResponse extends DeepPartial<Response> {}
export interface IResponseRequestPayload extends Omit<IResponseResponse, 'shapes'> {
  scenarioGuid?: string;
  workshopGuid?: string;
  shapes: esri.Graphic;
}

import { Controller, Post, Body, Get, HttpException, Delete, Param, Patch } from '@nestjs/common';
import { DeepPartial, getRepository } from 'typeorm';

import { Response, Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ResponsesService } from './responses.service';

@Controller('responses')
export class ResponsesController extends BaseController<Response> {
  constructor(private service: ResponsesService) {
    super(service);
  }

  /**
   * Retrieves a specific existing scenario user response.
   */
  @Get(':guid')
  public async getOne(@Param() params: IResponseRequest) {
    return this.service.getOne({ where: { guid: params.guid }, relations: ['scenario'] });
  }

  /**
   * Updates an existing scenario user response.
   */
  @Patch(':guid')
  public async update(@Param() params: IResponseRequest, @Body() body: IResponseRequest) {
    return this.service.repository.update({ guid: params.guid }, { ...body });
  }

  /**
   * Deletes an existing scenario user response.
   */
  @Delete(':guid')
  public async delete(@Param() params: IResponseRequest) {
    return this.service.repository.delete({ guid: params.guid });
  }

  /**
   * Returns a list of all scenario user responses and its associated scenario
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['scenario'] });
  }

  /**
   * Inserts a scenario user response
   */
  @Post('')
  public async insert(@Body() body: IResponseRequest) {
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

export interface IResponseRequest extends DeepPartial<Response> {
  workshopGuid?: string;
  scenarioGuid?: string;
}

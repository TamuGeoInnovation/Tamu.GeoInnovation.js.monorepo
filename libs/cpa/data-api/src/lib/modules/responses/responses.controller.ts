import { Controller, Post, Body, Get, HttpException, Delete, Param, Patch } from '@nestjs/common';
import { getRepository, DeepPartial } from 'typeorm';

import { Response, Workshop, Scenario } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { ResponsesService } from './responses.service';

@Controller('responses')
export class ResponsesController extends BaseController<Response> {
  constructor(private service: ResponsesService) {
    super(service);
  }

  @Get(':workshopGuid/:scenarioGuid')
  public async getAllForScenarioAndWorkshop(@Param() params) {
    return this.service.getAllForBoth(params);
    /*return await this.service.repository
      .createQueryBuilder('r')
      .where('r.workshopGuid = :w AND r.scenarioGuid = :s', {
        w: params.workshopGuid,
        s: params.scenarioGuid
      })
      .getMany();*/
  }

  /**
   * Retrieves a specific existing scenario user response.
   */
  @Get(':guid')
  public async getOne(@Param() params /*: IResponseRequestPayload*/) {
    const existing = await this.service.getSpecific(params);
    if (existing) {
      return existing;
    } else {
      throw new HttpException('Not Found', 404);
    }
    //return this.service.getOne({ where: { guid: params.guid }, relations: ['scenario'] });
  }

  /**
   * Updates an existing scenario user response.
   */
  @Patch(':guid')
  public async update(@Param() params /*: IResponseRequestPayload*/, @Body() body /*: IResponseRequestPayload*/) {
    return this.service.updateExisting(params, body);
    //return this.service.repository.update({ guid: params.guid }, { ...body });
  }

  /**
   * Deletes an existing scenario user response.
   */
  @Delete(':guid')
  public async delete(@Param() params /*: IResponseRequestPayload*/) {
    return this.service.deleteExisting(params);
    //return this.service.repository.delete({ guid: params.guid });
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
  public async insert(@Body() body /*: IResponseRequestPayload*/) {
    return this.service.insertNew(body);
    /*const existing = await this.service.getOne({ where: { guid: body.guid } });

    if (existing === undefined) {
      const workshop = await getRepository(Workshop).findOne({ guid: body.workshopGuid });
      const scenario = await getRepository(Scenario).findOne({ guid: body.scenarioGuid });

      if (workshop && scenario) {
        const entity = { ...body, workshop, scenario };

        return this.service.createOne(entity);
      } else {
        throw new HttpException('Missing resource.', 404);
      }
    } else {
      throw new HttpException('Internal server error.', 500);
    }*/
  }
}

/*export interface IResponseResponse extends DeepPartial<Response> {}
export interface IResponseRequestPayload extends Omit<IResponseResponse, 'shapes'> {
  scenarioGuid?: string;
  workshopGuid?: string;
  shapes: object;
}*/

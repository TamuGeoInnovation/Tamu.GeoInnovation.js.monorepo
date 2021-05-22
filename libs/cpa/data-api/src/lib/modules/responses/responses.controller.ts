import { Controller, Post, Body, Get, HttpException, Delete, Param, Patch } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { Response } from '@tamu-gisc/cpa/common/entities';
import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';

import { BaseController } from '../base/base.controller';
import { ResponsesService } from './responses.service';

@Controller('responses')
export class ResponsesController extends BaseController<Response> {
  constructor(private service: ResponsesService) {
    super(service);
  }

  /**
   * Retrieves all user responses for a given workshop
   */
  @Get('workshop/:workshopGuid')
  public async getAllForWorkshop(@Param() params) {
    return await this.service.getManyForWorkshop(params.workshopGuid);
  }

  @Get(':workshopGuid/:snapshotGuid')
  public async getAllForSnapshotAndWorkshop(@Param() params) {
    return this.service.getAllForBoth(params);
  }

  /**
   * Retrieves a specific existing snapshot user response.
   */
  @Get(':guid')
  public async getOne(@Param() params: IResponseRequestPayload) {
    const existing = await this.service.getSpecific(params);
    if (existing) {
      return existing;
    } else {
      throw new HttpException('Not Found', 404);
    }
  }

  /**
   * Updates an existing snapshot user response.
   */
  @Patch(':guid')
  public async update(@Param() params, @Body() body) {
    return this.service.updateExisting(params, body);
  }

  /**
   * Deletes an existing snapshot user response.
   */
  @Delete(':guid')
  public async delete(@Param() params) {
    return this.service.deleteExisting(params);
  }

  /**
   * Returns a list of all snapshot user responses and its associated snapshot.
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['snapshot'] });
  }

  /**
   * Inserts a snapshot user response.
   */
  @Post('')
  public async insert(@Body() body: IResponseRequestPayload) {
    return this.service.insertNew(body);
  }
}

export interface IResponseResponse extends DeepPartial<Response> {}

export interface IResponseResolved extends Omit<IResponseResponse, 'shapes'> {
  shapes: Array<IGraphic>;
}

export interface IResponseRequestPayload extends Omit<IResponseResponse, 'shapes'> {
  snapshotGuid?: string;
  workshopGuid?: string;
  scenarioGuid?: string;
  shapes: object;
}

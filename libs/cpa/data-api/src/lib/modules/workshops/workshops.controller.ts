import { Controller, Get, Post, Body, Delete, Param, Patch } from '@nestjs/common';

import { Workshop } from '@tamu-gisc/cpa/common/entities';
import { DeepPartial } from 'typeorm';

import { BaseController } from '../base/base.controller';
import { WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshop> {
  constructor(private service: WorkshopsService) {
    super(service);
  }

  /**
   * Adds a snapshot to a workshop
   */
  @Post('snapshot')
  public async addSnapshot(@Body() body: IWorkshopSnapshotPayload) {
    return await this.service.addNewSnapshot(body);
  }

  /**
   * Deletes a snapshot from a workshop
   */
  @Delete('snapshot/:workshopGuid/:snapshotGuid')
  public async deleteSnapshot(@Param() params: IWorkshopSnapshotPayload) {
    return await this.service.deleteSnapshot(params);
  }

  /**
   * Deletes a snapshot from a workshop
   */
  @Delete('scenario/:workshopGuid/:scenarioGuid')
  public async deleteScenario(@Param() params: IWorkshopScenarioPayload) {
    return await this.service.deleteScenario(params);
  }

  /**
   * Adds a Scenario to a workshop
   */
  @Post('scenario')
  public async addScenario(@Body() body: IWorkshopScenarioPayload) {
    return await this.service.addNewScenario(body);
  }

  /**
   * Returns a specific workshop record.
   */
  @Get(':guid')
  public async getOne(@Param() params) {
    return await this.service.getWorkshop(params);
  }

  /**
   * Updates an existing workshop record with provided body key-values.
   */
  @Patch(':guid')
  public async updateOne(@Body() body, @Param() params) {
    return await this.service.updateWorkshop(body, params);
  }

  /**
   * Removes an existing workshop record.
   */
  @Delete(':guid')
  public async deleteOne(@Param() params) {
    return await this.service.deleteWorkshop(params);
  }

  /**
   * Returns a list of all workshops and their associated snapshots.
   */
  @Get('')
  public getAll() {
    return this.service.getMany({ relations: ['snapshots', 'scenarios'] });
  }
}

export interface IWorkshopRequestPayload extends DeepPartial<Workshop> {
  guid: string;
}
export interface IWorkshopSnapshotPayload {
  snapshotGuid: string;
  workshopGuid: string;
}

export interface IWorkshopScenarioPayload {
  scenarioGuid: string;
  workshopGuid: string;
}

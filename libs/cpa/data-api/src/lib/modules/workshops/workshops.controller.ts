import { Controller, Get, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Workshop } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { IWorkshopExtractedSnapshots, WorkshopsService } from './workshops.service';

@Controller('workshops')
export class WorkshopsController extends BaseController<Workshop | IWorkshopExtractedSnapshots> {
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
   * Sets snapshots for a workshop from an array of snapshot guids
   */
  @Post('snapshots')
  public async setSnapshots(@Body() body: IWorkshopSnapshotsPayload) {
    return await this.service.setSnapshots(body);
  }

  /**
   * Deletes a snapshot from a workshop
   */
  @Delete('snapshot/:workshopGuid/:snapshotGuid')
  public async deleteSnapshot(@Param() params: IWorkshopSnapshotPayload) {
    return await this.service.removeWorkshopSnapshot(params);
  }

  /**
   * Deletes a snapshot from a workshop
   */
  @Delete('scenario/:workshopGuid/:scenarioGuid')
  public async deleteScenario(@Param() params: IWorkshopScenarioPayload) {
    return await this.service.removeWorkshopScenario(params);
  }

  /**
   * Sets scenarios for a workshop from an array of snapshot guids
   */
  @Post('scenarios')
  public async setScenarios(@Body() body: IWorkshopScenariosPayload) {
    return await this.service.setScenarios(body);
  }

  /**
   * Adds a Scenario to a workshop
   */
  @Post('scenario')
  public async addScenario(@Body() body: IWorkshopScenarioPayload) {
    return await this.service.addNewScenario(body);
  }

  /**
   * Adds a contextual Snapshot to a workshop
   */
  @Post('context')
  public async addContext(@Body() body: IWorkshopSnapshotPayload) {
    return await this.service.addNewContextSnapshot(body);
  }

  /**
   * Deletes a contextual Snapshot from a workshop
   */
  @Delete('context/:workshopGuid/:snapshotGuid')
  public async deleteContext(@Param() params: IWorkshopSnapshotPayload) {
    return await this.service.removeWorkshopContextSnapshot(params);
  }

  /**
   * Returns a specific workshop record which includes snapshots, scenarios, and contexts
   */
  @Get(':guid')
  public async getOne(@Param() params) {
    return await this.service.getWorkshop(params.guid, true, true, true, false);
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

export interface IWorkshopSnapshotsPayload {
  snapshotGuids: Array<string>;
  workshopGuid: string;
}

export interface IWorkshopScenarioPayload {
  scenarioGuid: string;
  workshopGuid: string;
}

export interface IWorkshopScenariosPayload {
  scenarioGuids: Array<string>;
  workshopGuid: string;
}

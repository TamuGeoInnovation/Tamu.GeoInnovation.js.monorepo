import { Controller, Patch, Param, Body, Delete, Get, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { SnapshotsService } from './snapshots.service';

@Controller('snapshots')
export class SnapshotsController extends BaseController<Snapshot> {
  constructor(private service: SnapshotsService) {
    super(service);
  }

  /**
   * Gets a list of snapshots for a workshop
   */
  @Get('workshop/:guid')
  public async getSnapshotsForWorkshop(@Param() params: { guid: string }) {
    return this.service.getSnapshotsForWorkshop(params.guid);
  }

  /**
   * Gets a list of snapshots for a workshop
   */
  @Get('context/workshop/:guid')
  public async getContextsForWorkshop(@Param() params: { guid: string }) {
    return this.service.getContextsForWorkshop(params.guid);
  }

  @Get('simplified')
  public async getSimplifiedWithWorkshops() {
    return this.service.getSimplifiedWithWorkshops();
  }

  @Post('many')
  public async getManySnapshotsWhere(@Body() body) {
    const where = {
      where: {
        [body.prop]: body.value
      }
    };
    return this.service.getMany(where);
  }

  @Post('copy')
  public async createSnapshotCopy(@Body() body: { guid: string }) {
    return await this.service.createSnapshotCopy(body.guid);
  }

  /**
   * Updates an existing snapshot
   */
  @Patch(':guid')
  public async update(@Param() params: ISnapshotPartial, @Body() body: ISnapshotPartial) {
    return await this.service.updateSnapshot(params, body);
  }

  /**
   * Deletes an existing snapshot
   */
  @Delete(':guid')
  public async delete(@Param() params: ISnapshotPartial) {
    return await this.service.deleteSnapshot(params);
  }
}

export interface ISnapshotPartial extends DeepPartial<Snapshot> {}

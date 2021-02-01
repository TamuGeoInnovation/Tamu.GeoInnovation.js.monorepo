import { Controller, Patch, Param, Body, Delete, Get } from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

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
   * Updates an existing snapshot
   */
  @Patch(':guid')
  public async update(@Param() params: ISnapshotsRequestPayload, @Body() body: ISnapshotsRequestPayload) {
    return await this.service.updateSnapshot(params, body);
  }

  /**
   * Deletes an existing snapshot
   */
  @Delete(':guid')
  public async delete(@Param() params: ISnapshotsRequestPayload) {
    return await this.service.deleteSnapshot(params);
  }
}

export interface ISnapshotsRequestPayload extends DeepPartial<Snapshot> {}

export interface ISnapshotsResponse extends Omit<DeepPartial<Snapshot>, 'layers'> {
  layers: { url: string; info: ILayerConfiguration }[];
}

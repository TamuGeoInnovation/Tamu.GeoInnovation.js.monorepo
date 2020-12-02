import { Controller, Patch, Param, Body, Delete } from '@nestjs/common';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

import { BaseController } from '../base/base.controller';
import { SnapshotsService, ISnapshotsRequestPayload } from './snapshots.service';

@Controller('snapshots')
export class SnapshotsController extends BaseController<Snapshot> {
  constructor(private service: SnapshotsService) {
    super(service);
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

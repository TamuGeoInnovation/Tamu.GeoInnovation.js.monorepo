import { Controller, Get, Param } from '@nestjs/common';

import { LayersService } from './layers.service';

@Controller('layers')
export class LayersController {
  constructor(private service: LayersService) {}

  @Get()
  public getLayers() {
    return 'Not implemented';
  }

  /**
   * Returns live layers available for a workshop.
   *
   * This is essentially a list of unique snapshots that have participant
   * submissions. The submissions are treated as part of a feature collection
   * used as a live layer.
   */
  @Get('workshop/:workshop')
  public getWorkshopLayers(@Param('workshop') workshop: string) {
    return this.service.getLayersForWorkshop(workshop);
  }

  /**
   * Retrieves all of the submissions for a workshop and snapshot
   */
  @Get(':workshopGuid/:snapshotGuid')
  public getSnapshotSubmissionsAsLayer(@Param() params) {
    const { workshopGuid, snapshotGuid } = params;

    return this.service.getResponsesForWorkshopAndSnapshot(workshopGuid, snapshotGuid);
  }
}

import { Controller, Get, Param } from '@nestjs/common';

import { IGraphic } from '@tamu-gisc/common/utils/geometry/esri';
import { ILayerConfiguration } from '@tamu-gisc/maps/feature/forms';

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

export interface CPALayer {
  /**
   * Esri layer definition.
   *
   * Used when the layer group is 'feature'.
   */
  url?: string;

  /**
   * Esri graphics in their JSON portal representation.
   *
   * Used when the layer type is 'graphic'.
   */
  graphics?: Array<IGraphic>;

  /**
   * Esri layer definitions.
   *
   * Used when the layer type is 'group'
   */
  layers?: Array<CPALayer>;

  /**
   * Layer metadata
   */
  info?: ILayerConfiguration;
}

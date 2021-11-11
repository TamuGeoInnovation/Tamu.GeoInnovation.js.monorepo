import { Controller, Get } from '@nestjs/common';
import { SubmissionLocation } from '@tamu-gisc/gisday/common';

import { BaseController } from '../_base/base.controller';
import { MapService } from './map.service';

@Controller('map')
export class MapController extends BaseController<SubmissionLocation> {
  constructor(private service: MapService) {
    super(service);
  }

  @Get()
  public getLocations() {
    return this.service.getLocations();
  }

  @Get('geojson')
  public getFeatureCollection() {
    return this.service.getLocations(true);
  }
}

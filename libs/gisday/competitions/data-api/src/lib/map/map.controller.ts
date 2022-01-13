import { Controller, Get } from '@nestjs/common';

import { BaseController } from '../_base/base.controller';
import { CompetitionSubmission } from '../entities/all.entities';
import { MapService } from './map.service';

@Controller('map')
export class MapController extends BaseController<CompetitionSubmission> {
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

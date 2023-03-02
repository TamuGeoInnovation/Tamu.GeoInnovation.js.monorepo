import { Body, Controller, Get } from '@nestjs/common';

import { BaseController } from '../_base/base.controller';
import { CompetitionSubmission } from '../entities/all.entities';
import { MapService } from './map.service';

@Controller('map')
export class MapController extends BaseController<CompetitionSubmission> {
  constructor(private service: MapService) {
    super(service);
  }

  @Get()
  public getLocations(@Body() { season }) {
    return this.service.getLocations(season);
  }

  @Get('geojson')
  public getFeatureCollection(@Body() { season }) {
    return this.service.getLocations(season, true);
  }
}

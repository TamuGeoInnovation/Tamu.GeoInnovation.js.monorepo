import { Body, Controller, Get } from '@nestjs/common';

import { MapService } from './map.service';

@Controller('competitions/maps')
export class MapController {
  constructor(private service: MapService) {}

  @Get()
  public getLocations(@Body() { season }) {
    return this.service.getLocations(season);
  }

  @Get('geojson')
  public getFeatureCollection(@Body() { season }) {
    return this.service.getLocations(season, true);
  }
}

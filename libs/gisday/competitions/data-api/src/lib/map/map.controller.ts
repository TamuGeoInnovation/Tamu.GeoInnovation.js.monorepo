import { Controller, Get, NotImplementedException, Param, Query } from '@nestjs/common';

import { MapService } from './map.service';

@Controller('competitions/maps')
export class MapController {
  constructor(private service: MapService) {}

  @Get('seasons/active')
  public getFeatureCollectionForActiveSeason(@Query('format') format) {
    return this.service.getLocationsForActiveSeason(format);
  }

  @Get('seasons/:guid')
  public getFeatureCollectionForSeason(@Param('guid') guid, @Query('format') format) {
    return this.service.getLocationsForSeasonId(guid, format);
  }

  @Get()
  public getLocations() {
    throw new NotImplementedException();
  }
}

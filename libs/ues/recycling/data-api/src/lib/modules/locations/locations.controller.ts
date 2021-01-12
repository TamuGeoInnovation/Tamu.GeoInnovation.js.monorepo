import { Controller, Get } from '@nestjs/common';

import { Location } from '@tamu-gisc/ues/recycling/common/entities';

import { BaseController } from '../base/base.controller';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController extends BaseController<Location> {
  constructor(private service: LocationsService) {
    super(service);
  }

  @Get('')
  public getLocations() {
    return this.service.getLocations();
  }

  @Get('results')
  public getResultsPerLocation() {
    return this.service.getLocationAndResults();
  }
}

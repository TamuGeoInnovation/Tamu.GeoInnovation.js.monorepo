import { Controller, Get, UseGuards } from '@nestjs/common';

import { AzureIdpGuard } from '@tamu-gisc/oidc/client';
import { Location } from '@tamu-gisc/ues/recycling/common/entities';

import { BaseController } from '../base/base.controller';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController extends BaseController<Location> {
  constructor(private service: LocationsService) {
    super(service);
  }

  @UseGuards(AzureIdpGuard)
  @Get('')
  public getLocations() {
    return this.service.getLocations();
  }

  @UseGuards(AzureIdpGuard)
  @Get('results')
  public getResultsPerLocation() {
    return this.service.getLocationAndResults();
  }
}

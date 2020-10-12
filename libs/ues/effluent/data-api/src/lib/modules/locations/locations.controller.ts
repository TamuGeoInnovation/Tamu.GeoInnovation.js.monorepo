import { Controller, Get } from '@nestjs/common';

import { Location } from '@tamu-gisc/ues/effluent/common/entities';

import { LocationsService } from './locations.service';
import { BaseController } from '../base/base.controller';

@Controller('locations')
export class LocationsController extends BaseController<Location> {
  constructor(private service: LocationsService) {
    super(service);
  }

  @Get('')
  public getLocations() {
    return this.service.getLocations();
  }
}

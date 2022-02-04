import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @Get('basic/:format')
  public getBasicGeojsonVehicles(@Param('format') format: string) {
    return this.service.getBasicVehiclesAsGeojson(format);
  }

  @UseGuards(BearerGuard)
  @Get('')
  public getVehicles() {
    return this.service.getAllVehicles();
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly service: VehiclesService) {}

  @UseGuards(BearerGuard)
  @Get('')
  public getVehicles() {
    return this.service.getAllVehicles();
  }
}

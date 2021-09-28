import { Controller, Get, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';

@Controller('trips')
export class TripsController {
  @UseGuards(BearerGuard)
  @Get('')
  public getTrips() {
    return 'These are trips';
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';

import { TokenGuard } from '../../auth/token/token.guard';

@Controller('trips')
export class TripsController {
  @UseGuards(TokenGuard)
  @Get('')
  public getTrips() {
    return 'These are trips';
  }
}

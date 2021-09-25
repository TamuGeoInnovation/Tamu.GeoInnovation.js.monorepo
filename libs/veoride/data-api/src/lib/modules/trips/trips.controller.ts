import { Controller, Get, UnauthorizedException } from '@nestjs/common';

import { RequiredQueryParams } from '@tamu-gisc/common/nest/guards';

@Controller('trips')
export class TripsController {
  @RequiredQueryParams(['token'], UnauthorizedException)
  @Get('')
  public getTrips() {
    return 'These are trips';
  }
}

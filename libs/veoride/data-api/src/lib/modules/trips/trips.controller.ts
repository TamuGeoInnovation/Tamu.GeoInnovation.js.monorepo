import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

import { RequiredQueryParams } from '@tamu-gisc/common/nest/guards';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @UseGuards(BearerGuard)
  @RequiredQueryParams(['end_time'], BadRequestException)
  @Get('')
  public getTrips(@Query() query, @Req() req) {
    return this.service.requestStatusChangeData({ queryParams: JSON.stringify(query), userId: req.user.guid });
  }
}

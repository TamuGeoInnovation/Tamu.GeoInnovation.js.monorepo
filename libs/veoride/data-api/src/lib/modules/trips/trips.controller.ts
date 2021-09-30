import { BadRequestException, Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

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
    return this.service.requestStatusChangeData({ queryParams: query, userId: req.user.guid }, req);
  }

  @Get(':id')
  public getCompiledStusChangesDataset(@Param('id') id: string, @Res() res: Response) {
    const diskPath = this.service.fetchDatasetDiskPath(id);
    res.download(diskPath);
  }
}

import { BadRequestException, Controller, Get, NotFoundException, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { QueryParamGuard, RequiredQueryParams } from '@tamu-gisc/common/nest/guards';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly service: TripsService) {}

  @Get(':id/download')
  public async streamCompiledDataset(@Param('id') id: string, @Res() res: Response) {
    const diskPath = await this.service.fetchDatasetDiskPath(id);

    if (diskPath) {
      res.download(diskPath);
    } else {
      const e = new NotFoundException();
      res.status(e.getStatus());
      res.json(e.getResponse());
    }
  }

  @Get(':id')
  public getCompiledStusChangesDataset(@Param('id') id: string) {
    return this.service.retrieveDataRequestDetails(id);
  }

  @UseGuards(BearerGuard, QueryParamGuard)
  @RequiredQueryParams(['end_time'], BadRequestException)
  @Get('')
  public getTrips(@Query() query, @Req() req) {
    return this.service.requestStatusChangeData({ queryParams: query, userId: req.user.guid });
  }
}

import { Response } from 'express';
import { BadRequestException, Controller, Get, NotFoundException, Param, Query, Req, Res, UseGuards } from '@nestjs/common';

import { QueryParamGuard, RequiredQueryParams } from '@tamu-gisc/common/nest/auth';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { StatusChangesService } from './status-changes.service';

@Controller('status-changes')
export class StatusChangesController {
  constructor(private readonly service: StatusChangesService) {}

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

  @Get('')
  @UseGuards(BearerGuard, QueryParamGuard)
  @RequiredQueryParams(['event_time'], BadRequestException)
  public getStatusChanges(@Query() query, @Req() req) {
    return this.service.requestStatusChangeData({ queryParams: query, userId: req.user.guid });
  }
}

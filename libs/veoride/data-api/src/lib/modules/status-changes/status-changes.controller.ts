import { BadRequestException, Controller, Get, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { RequiredQueryParams } from '@tamu-gisc/common/nest/guards';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { StatusChangesService } from './status-changes.service';

@Controller('status-changes')
export class StatusChangesController {
  constructor(private readonly service: StatusChangesService) {}

  @Get('')
  @UseGuards(BearerGuard)
  @RequiredQueryParams(['event_time'], BadRequestException)
  public getStatusChanges(@Query() query, @Req() req) {
    return this.service.requestStatusChangeData({ queryParams: query, userId: req.user.guid }, req);
  }

  @Get(':id')
  public getCompiledStusChangesDataset(@Param('id') id: string, @Res() res: Response) {
    const diskPath = this.service.fetchDatasetDiskPath(id);
    res.download(diskPath);
  }
}

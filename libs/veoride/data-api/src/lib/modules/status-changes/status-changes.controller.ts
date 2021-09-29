import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';

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
    return this.service.requestStatusChangeData({ queryParams: JSON.stringify(query), userId: req.user.guid });
  }
}

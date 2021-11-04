import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';
import { GetLogsForResourceDto, LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly service: LogsService) {}

  @UseGuards(BearerGuard)
  @Get('')
  public getLogs(@Query() params: GetLogsForResourceDto) {
    return this.service.getLatestForResource(params);
  }
}

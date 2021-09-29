import { Controller, Get, UseGuards } from '@nestjs/common';

import { BearerGuard } from '../auth/guards/bearer-guard/bearer-guard.guard';

@Controller('status-changes')
export class StatusChangesController {
  @Get('')
  @UseGuards(BearerGuard)
  public getStatusChanges() {
    return 'These are status changes';
  }
}

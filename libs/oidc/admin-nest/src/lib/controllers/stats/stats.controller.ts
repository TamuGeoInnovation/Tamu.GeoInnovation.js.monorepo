import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { StatService } from '../../services/stats/stats.service';

@UseGuards(AdminRoleGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statService: StatService) {}

  @Get()
  public async statsGet() {
    return this.statService.countOfLoggedInUsers();
  }

  @Get('2')
  public async stats2Get() {
    return this.statService.countOfUsersByClient();
  }

  @Get('3')
  public async stats3Get() {
    return this.statService.countOfNewUsers();
  }

  @Get('4')
  public async stats4Get() {
    return this.statService.totalLoginsPastMonth();
  }
}

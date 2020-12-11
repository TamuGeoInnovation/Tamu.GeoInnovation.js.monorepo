import { Controller, Get, UseGuards } from '@nestjs/common';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { StatService } from '../../services/stats/stats.service';

@UseGuards(AdminRoleGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statService: StatService) {}

  @Get('count/users/loggedin')
  public async statsGet() {
    return this.statService.countOfLoggedInUsers();
  }

  @Get('count/users/client')
  public async stats2Get() {
    return this.statService.countOfUsersByClient();
  }

  @Get('count/users/new')
  public async stats3Get() {
    return this.statService.countOfNewUsers();
  }

  @Get('count/logins')
  public async stats4Get() {
    return this.statService.totalLoginsPastMonth();
  }
}

import { Controller, Get, UseGuards, Redirect, Request } from '@nestjs/common';

import { AppService } from './app.service';
import { AdminRoleGuard, AuthenticatedGuard, ManagerRoleGuard, OpenIdClient } from '@tamu-gisc/oidc';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthenticatedGuard)
  @Get()
  public index(@Request() req) {
    return {
      user: req.user
    }
  }

  @UseGuards(AdminRoleGuard)
  @Get('admin')
  public adminTest() {
    return {
      "admin": true
    }
  }

  @UseGuards(ManagerRoleGuard)
  @Get('manager')
  public managerTest() {
    return {
      "manager": true
    }
  }

}

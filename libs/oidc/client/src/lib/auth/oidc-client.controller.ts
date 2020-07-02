import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';

import { AdminRoleGuard, ManagerRoleGuard, UserRoleGuard } from '../guards/roles.guard';
import { LoginGuard } from '../guards/login.guard';
import { OpenIdClient } from './open-id-client';

@Controller('oidc')
export class OidcClientController {
  @UseGuards(LoginGuard)
  @Get('/login')
  public login(@Response() res) {
    // No logic here. LoginGuard will callback to /auth/callback
  }

  @Get('/logout')
  public async logout(@Request() req, @Response() res) {
    req.logout();
    res.redirect(await OpenIdClient.client.endSessionUrl());
  }

  @UseGuards(LoginGuard)
  @Get('/auth/callback')
  public authCallback(@Response() res, @Request() req) {
    // if (req && req.session && req.session.returnUrl) {
    //   res.redirect(req.session.returnUrl);
    // }
    res.redirect('/home')
  }

  @UseGuards(AdminRoleGuard)
  @Get('/admin')
  public admin(@Request() req) {
    return {
      greeting: 'Hello admin'
    };
  }

  @UseGuards(ManagerRoleGuard)
  @Get('/manager')
  public manager(@Request() req) {
    return {
      greeting: 'Hello manager or admin'
    };
  }

  @UseGuards(UserRoleGuard)
  @Get('/user')
  public user(@Request() req) {
    return {
      greeting: 'Hello user, manager, or admin'
    };
  }
}

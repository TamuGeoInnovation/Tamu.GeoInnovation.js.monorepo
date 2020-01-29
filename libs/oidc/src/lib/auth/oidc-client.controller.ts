import { Controller, Get, Next, Request, Response, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { AdminRoleGuard, ManagerRoleGuard, UserRoleGuard } from '../guards/roles.guard';
import { OpenIdClient } from './open-id-client';

@Controller('oidc')
export class OidcClientController {

  @UseGuards(LoginGuard)
  @Get('/login')
  public login(@Response() res) {
    res.redirect('/home');
  }

  @Get('/logout')
  public async logout(@Request() req, @Response() res) {
    req.logout();
    res.redirect(await OpenIdClient.client.endSessionUrl());
  }

  @UseGuards(LoginGuard)
  @Get('/auth/callback')
  public authCallback(@Response() res, @Request() req) {
    res.redirect('/home');
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

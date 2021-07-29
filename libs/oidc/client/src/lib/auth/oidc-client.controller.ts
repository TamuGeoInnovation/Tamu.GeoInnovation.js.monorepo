import { Controller, Get, Inject, Optional, Request, Response, UseGuards } from '@nestjs/common';

import { AdminRoleGuard, AzureIdpGuard, ManagerRoleGuard, UserRoleGuard } from '../guards/roles.guard';
import { LoginGuard } from '../guards/login.guard';
import { OpenIdClient } from './open-id-client';

@Controller('oidc')
export class OidcClientController {
  @UseGuards(LoginGuard)
  @Get('/login')
  public login() {
    // No logic here. LoginGuard will callback to /auth/callback
  }

  @Get('/logout')
  public async logout(@Request() req, @Response() res) {
    const endSessionUrl = await OpenIdClient.client.endSessionUrl();

    req.logout();
    res.redirect(`${endSessionUrl}&id_token_hint=${req.user.id_token}`);
  }

  @UseGuards(LoginGuard)
  @Get('/auth/callback')
  public authCallback(@Response() res, @Request() req) {
    if (req && req.session && req.session.returnUrl) {
      res.redirect(req.session.returnUrl);
    }
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

  @UseGuards(AzureIdpGuard)
  @Get('/userinfo')
  public getUserInfo(@Request() req) {
    const user = JSON.parse(JSON.stringify(req.user));

    delete user.access_token;
    delete user.id_token;
    delete user.token_type;
    delete user.expires_at;
    delete user.ext_expires_in;
    delete user.scope;
    delete user.session_state;
    delete user.sub;
    delete user.claims.sub;

    return user;
  }
}

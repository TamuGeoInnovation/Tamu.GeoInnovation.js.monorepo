import { Controller, Get, Next, Request, Response, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { LoginGuard } from '../guards/login.guard';
import { OpenIdClient } from './open-id-client';

@Controller('oidc')
export abstract class OidcClientController {
  private home: String = '/home';

  constructor(home?: String) {
    if (home) {
      this.home = home;
    }
  }

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
}

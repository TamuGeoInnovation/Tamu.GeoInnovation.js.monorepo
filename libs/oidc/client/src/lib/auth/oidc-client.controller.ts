import { Controller, Get, Inject, Request, Response, UseGuards } from '@nestjs/common';

import { AdminRoleGuard, AzureIdpGuard, ManagerRoleGuard, UserRoleGuard } from '../guards/roles.guard';
import { LoginGuard } from '../guards/login.guard';
import { OpenIdClient } from './open-id-client';
import { ClientRoles } from '../types/auth-types';

@Controller('oidc')
export class OidcClientController {
  constructor(@Inject('ROLES') public roles: ClientRoles) {}

  @UseGuards(LoginGuard)
  @Get('/login')
  public login() {
    // No logic here. LoginGuard will callback to /auth/callback
  }

  @Get('/logout')
  public async logout(@Request() req, @Response() res) {
    const endSessionUrl = await OpenIdClient.client.endSessionUrl();
    req.logout();
    res.redirect(endSessionUrl);
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
    if (this.roles && req.user.claims.groups) {
      // Match, map, and filter each of the provided roles with the user groups, to return only the key of the role,
      // and not the id.
      const roles = Object.entries(this.roles)
        .filter(([name, id]) => {
          if (req.user.claims.groups.includes(id)) {
            return name;
          }
        })
        .map(([name, id]) => {
          return name;
        });

      // Overwrite the groups with the processed list of roles.
      req.user.claims.groups = roles;

      return req.user;
    } else {
      // Remove roles claim, if any, to avoid leaking them (?)
      delete req.user.claims.roles;
    }

    return req.user;
  }
}

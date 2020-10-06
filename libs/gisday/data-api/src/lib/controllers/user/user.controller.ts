import { Controller, Get, Req } from '@nestjs/common';
import { OpenIdClient } from '@tamu-gisc/oidc/client';

@Controller('user')
export class UserController {
  @Get()
  async getStatus(@Req() req) {
    if (req.user) {
      return OpenIdClient.client.introspect(req.user.access_token);
    } else {
      return 200;
    }
  }

  @Get('role')
  async getUserRole(@Req() req) {
    if (req.user) {
      return OpenIdClient.client.userinfo(req.user.access_token);
    } else {
      return 200;
    }
  }

  @Get('logout')
  async userLogout(@Req() req) {
    if (req.user) {
      return OpenIdClient.client.revoke(req.user.access_token);
    } else {
      return 200;
    }
  }
}

// "token_endpoint": "http://localhost:4001/oidc/token",
// "userinfo_endpoint": "http://localhost:4001/oidc/me",

import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { OpenIdClient } from '@tamu-gisc/oidc/client';

@Controller('user')
export class UserController {
  // @Get()
  // async getStatus(@Req() req, @Res() res: Response) {
  //   if (req.user) {
  //     return OpenIdClient.client.introspect(req.user.access_token);
  //   } else {
  //     res.status(401);
  //     res.send(undefined);
  //   }
  // }

  @Get()
  async getStatus(@Req() req, @Res() res: Response) {
    if (req.user) {
      if (req.user.access_token) {
        const introspectionResult = await OpenIdClient.client.introspect(req.user.access_token);
        if (introspectionResult) {
          if (introspectionResult.active === false) {
            res.send(false);
          } else {
            res.send(true);
          }
        }
      } else {
        // no access_token
        res.send(false);
      }
    } else {
      // no req.user
      res.send(false);
    }
  }

  @Get('header')
  async getHeaderStatus(@Req() req, @Res() res: Response) {
    if (req.user) {
      const introspectionResult = await OpenIdClient.client.introspect(req.user.access_token);
      if (introspectionResult) {
        if (introspectionResult.active === false) {
          res.send(false);
        } else {
          res.send(true);
        }
      } else {
        res.send(false);
      }
    } else {
      // res.status(401);
      res.send(false);
    }
  }

  @Get('role')
  async getUserRole(@Req() req, @Res() res: Response) {
    if (req.user) {
      const accessToken = req.user.access_token;
      const result = await OpenIdClient.client.userinfo(accessToken);
      res.send(result);
    } else {
      res.status(401);
      res.send(undefined);
    }
  }

  @Get('logout')
  async userLogout(@Req() req, @Res() res: Response) {
    if (req.user) {
      const accessToken = req.user.access_token;
      const result = await OpenIdClient.client.revoke(accessToken);
      res.send(result);
    } else {
      res.status(401);
      res.send(undefined);
    }
  }
}

// "token_endpoint": "http://localhost:4001/oidc/token",
// "userinfo_endpoint": "http://localhost:4001/oidc/me",

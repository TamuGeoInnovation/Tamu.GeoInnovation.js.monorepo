import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { Account, User } from '../../entities/all.entity';
import { UserService, ServiceToControllerTypes } from '../../services/user/user.service';
import { authenticator } from 'otplib';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('register')
  async registerGet(@Req() req: Request, @Res() res: Response) {
    const locals = {
      title: 'GeoInnovation Service Center',
      client: {},
      debug: false,
      details: {},
      params: {},
      interaction: true,
      error: false,
      devMode: urlHas(req.path, 'dev', true),
      requestingHost: urlFragment('', 'hostname')
    };
    return res.render('register', locals, (err, html) => {
      if (err) throw err;
      res.render('_layout', {
        ...locals,
        body: html
      });
    });
  }

  @Post('register')
  async registerPost(@Req() req: Request, @Res() res: Response) {
    req.body.ip = req.ip;
    const existingUser = await this.userService.userRepo.findByKeyShallow('email', req.body.email);
    if (existingUser) {
      return res.render('register', {
        error: 'Username or password is incorrect',
        title: 'GeoInnovation Service Center',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true
      });
    } else {
      const newUser: User = new User(req);
      const newAccount: Account = new Account(req.body.name, req.body.email);
      newUser.account = newAccount;
      const userInserted = await this.userService.insertUser(newUser);
      // const accountInserted = await StaticAccountService.insertAccount(newAccount);
      return res.send(userInserted);
    }
  }

  @Get('2fa/enable/:guid')
  async enable2faGet(@Param() params, @Req() req: Request, @Res() res: Response) {
    if (params.guid) {
      const enable2fa = await this.userService.enable2FA(params.guid);
      if (enable2fa) {
        const issuer = 'GeoInnovation Service Center';
        const otpPath = authenticator.keyuri(
          encodeURIComponent((enable2fa as User).email),
          issuer,
          (enable2fa as User).secret2fa
        );
        return res.render('2fa-scan', {
          title: 'Two-factor Authentication',
          otpPath: JSON.stringify(otpPath)
        });
      }
    } else {
      return res.send({
        error: 'No guid provided'
      });
    }
  }

  @Post('2fa/disable')
  async disable2faPost(@Req() req: Request, @Res() res: Response) {
    if (req.body.guid) {
      const disable2fa = await this.userService.disable2fa(req.body.guid);
      if (disable2fa) {
        return res.sendStatus(200);
      }
    }
  }

  @Post('role')
  async addUserRolePost(@Req() req: Request) {
    this.userService.insertUserRole(req);
  }
  
}

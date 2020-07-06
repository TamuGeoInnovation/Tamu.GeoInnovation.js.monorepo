import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { Account, User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';
import { AccountService } from '../../services/account/account.service';

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
      const accountInserted = await AccountService.insertAccount(newAccount);
      return {
        userInserted,
        accountInserted
      };
    }
  }
}

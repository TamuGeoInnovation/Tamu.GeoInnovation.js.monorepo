import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { Account, User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';
import { AccountService } from '../../services/account/account.service';

@Controller('user')
export class UserController {
  @Get('auth')
  async authGet() {
    return '/user/auth';
  }

  @Get('register')
  async registerGet(@Req() req: Request, @Res() res: Response) {
    const locals = {
      title: 'GISC Identity Portal',
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
    const body = req.body;
    req.body.ip = req.ip;
    // const existingUser = await UserService.findUserByKey('email', body.login);
    const existingUser = await UserService.findByKey(User, 'email', body.login);
    if (existingUser) {
      return res.render('register', {
        error: 'Username or password is incorrect',
        title: 'GISC Identity Portal',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true
      });
    } else {
      const newUser: User = new User(req);
      const newAccount: Account = new Account(body.name, body.email);
      newUser.account = newAccount;
      const userInserted = await UserService.insertUser(newUser);
      const accountInserted = await AccountService.insertAccount(newAccount);
      return {
        userInserted,
        accountInserted
      };
    }
  }
}

import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import { hashSync } from 'bcrypt';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { Mailer } from '../../_utils/mailer.util';
import { Account, User, SecretAnswer } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('register')
  async registerGet(@Req() req: Request, @Res() res: Response) {
    const questions = await this.userService.getAllSecretQuestions();
    const locals = {
      title: 'GeoInnovation Service Center SSO',
      client: {},
      debug: false,
      details: {},
      params: {},
      interaction: true,
      error: false,
      questions: questions,
      devMode: urlHas(req.path, 'dev', true),
      requestingHost: urlFragment('', 'hostname')
    };
    return res.render('register', locals, (err, html) => {
      if (err) throw err;
      res.render('_registration-layout', {
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
      // TODO: This doesn't work right; no error message shown
      const questions = await this.userService.getAllSecretQuestions();
      const locals = {
        title: 'GeoInnovation Service Center SSO',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true,
        error: true,
        message: 'The email provided is already registered.',
        questions: questions,
        devMode: urlHas(req.path, 'dev', true),
        requestingHost: urlFragment('', 'hostname')
      };
      return res.render('register', locals, (err, html) => {
        if (err) throw err;
        res.render('_registration-layout', {
          ...locals,
          body: html
        });
      });
    } else {
      const newUser: User = new User(req);
      const newAccount: Account = new Account(req.body.name, req.body.email);
      newUser.account = newAccount;
      const userInserted = await this.userService.insertUser(newUser);
      this.userService.insertSecretAnswers(req, newUser);
      Mailer.sendAccountConfirmationEmail(newUser.email, newUser.guid);
      return res.send(userInserted);
    }
  }

  @Get('register/:guid')
  async registerConfirmedGet(@Param() params, @Res() res: Response) {
    await this.userService.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        email_verified: true
      })
      .where('guid = :guid', {
        guid: params.guid
      })
      .execute();
    return res.redirect('/');
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

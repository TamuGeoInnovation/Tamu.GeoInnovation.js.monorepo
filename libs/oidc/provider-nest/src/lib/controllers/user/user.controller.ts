import { Controller, Get, Param, Req, Res, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import { urlFragment, urlHas } from '../../_utils/url-utils';
import { User } from '../../entities/all.entity';
import { UserService, ServiceToControllerTypes } from '../../services/user/user.service';

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
    const newUser = await this.userService.insertUser(req);
    return res.send(`Welcome aboard, ${newUser.account.name}!`);
  }

  @Get('register/:guid')
  async registerConfirmedGet(@Param() params, @Res() res: Response) {
    this.userService.userVerifiedEmail(params.guid);
    return res.redirect('/');
  }

  @Post('2fa/enable')
  async enable2faGet(@Param() params, @Req() req: Request, @Res() res: Response) {
    if (req.body.guid) {
      const enable2fa = await this.userService.enable2FA(req.body.guid);
      if (enable2fa == ServiceToControllerTypes.CONDITION_ALREADY_TRUE) {
        return res.send({
          error: '2FA already enabled for user'
        });
      }
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

  @Post('pwr')
  async userForgotPasswordPost(@Req() req: Request) {
    this.userService.sendPasswordResetEmail(req);
  }

  @Get('pwr/:token')
  async loadAppropriatePWRViewGet(@Param() params, @Res() res: Response) {
    const stillValid = await this.userService.isPasswordResetTokenStillValid(params.token);
    if (stillValid) {
      const resetToken = await this.userService.passwordResetRepo.findByKeyShallow('token', params.token);
      const user = await this.userService.userRepo.findByKeyShallow('guid', resetToken.userGuid);
      // TODO: should we prompt those with 2fa to input their authcode before changing pw?
      const questions = await this.userService.getUsersQuestions(user);
      const locals = {
        title: 'GeoInnovation Service Center SSO',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true,
        error: false,
        guid: user.guid,
        token: params.token,
        questions
      };
      return res.render('password-reset', locals, (err, html) => {
        if (err) throw err;
        res.render('_password-reset-layout', {
          ...locals,
          body: html
        });
      });
    } else {
      return res.send('This link is no longer valid');
    }
  }

  @Post('pwr/:token')
  async compareAgainstSecretAnswersPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    if (this.userService.isPasswordResetTokenStillValid(params.token)) {
      const answersAreCorrect = await this.userService.areSecretAnswersCorrect(req);
      if (answersAreCorrect) {
        // both answers were correct
        const locals = {
          title: 'GeoInnovation Service Center SSO',
          client: {},
          debug: false,
          details: {},
          params: {},
          interaction: true,
          error: false,
          token: params.token
        };
        return res.render('new-password', locals, (err, html) => {
          if (err) throw err;
          res.render('_password-reset-layout', {
            ...locals,
            body: html
          });
        });
      } else {
        // one was wrong, show them the screen again
        const user = await this.userService.userRepo.findOne({
          where: {
            guid: req.body.guid
          }
        });
        const questions = await this.userService.getUsersQuestions(user);
        const locals = {
          title: 'GeoInnovation Service Center SSO',
          client: {},
          debug: false,
          details: {},
          params: {},
          interaction: true,
          error: true,
          message: 'Incorrect answer(s)',
          guid: req.body.guid,
          token: params.token,
          questions
        };
        return res.render('password-reset', locals, (err, html) => {
          if (err) throw err;
          res.render('_password-reset-layout', {
            ...locals,
            body: html
          });
        });
      }
    } else {
      // Token is expired
      return res.send('This link is no longer valid');
    }
  }

  @Post('npw/:token')
  async newPasswordPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    const updatedPassword = await this.userService.ifNewUpdatePassword(req, params.token);
    if (updatedPassword) {
      res.redirect('/');
    } else {
      // Hey this is a used password you doodoo head
      const messages: string[] = [];
      messages.push('You cannot re-use an old password');
      const locals = {
        title: 'GeoInnovation Service Center SSO',
        client: {},
        debug: false,
        details: {},
        params: {},
        interaction: true,
        error: true,
        message: messages,
        token: params.token
      };
      return res.render('new-password', locals, (err, html) => {
        if (err) throw err;
        res.render('_password-reset-layout', {
          ...locals,
          body: html
        });
      });
    }
  }
}

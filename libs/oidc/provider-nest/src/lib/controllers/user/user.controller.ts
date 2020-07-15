import { Controller, Get, Next, Param, Req, Res, Render, Post, HttpService } from '@nestjs/common';
import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import { hashSync } from 'bcrypt';

import { urlFragment, urlHas } from '../../_utils/url-utils';
import { Mailer } from '../../_utils/mailer.util';
import { Account, User, SecretAnswer, UserPasswordReset } from '../../entities/all.entity';
import { UserService, ServiceToControllerTypes } from '../../services/user/user.service';
import { SHA1HashUtils } from '../../_utils/sha1hash.util';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly httpService: HttpService) {}

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
      return res.send(`Welcome aboard, ${newUser.account.name}!`);
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
    // TODO: Move all this to the userService, get it out of ma controller
    const IPSTACK_APIKEY = '1e599a1240ca8f99f0b0d81a08324dbb';
    const IPSTACK_URL = 'http://api.ipstack.com/';

    const user = await this.userService.userRepo.findByKeyDeep('guid', req.body.guid);
    const _resetRequest: Partial<UserPasswordReset> = {
      userGuid: user.guid,
      initializerIp: req.ip
    };
    const resetRequest = await this.userService.passwordResetRepo.create(_resetRequest);
    resetRequest.setToken();
    this.httpService.get(`${IPSTACK_URL}${req.ip}?access_key=${IPSTACK_APIKEY}`).subscribe((observer) => {
      const location = observer.data.country_name;
      Mailer.sendPasswordResetRequestEmail(user, resetRequest, location);
      this.userService.passwordResetRepo.save(resetRequest).catch((typeOrmErr) => {
        debugger;
        console.warn(typeOrmErr);
      }); // INSERT NEW AccountManager.insertNewPWResetRequest(req.params.sub, token, req.ip);
    });
    // .unsubscribe();
  }

  @Get('pwr/:token')
  async loadAppropriatePWRViewGet(@Param() params, @Res() res: Response) {
    // TODO: Move all this to the userService, get it out of ma controller
    const stillValid = await this.userService.isPasswordResetLinkStillValid(params.token);
    if (stillValid) {
      const resetToken = await this.userService.passwordResetRepo.findByKeyShallow('token', params.token);
      const user = await this.userService.userRepo.findByKeyShallow('guid', resetToken.userGuid);
      // TODO: should we prompt those with 2fa to input their authcode before changing pw?
      const questionsAndAnswers = await this.userService.answerRepo.findAllByKeyDeep('user', user.guid);
      const questions: {
        text: string;
        guid: string;
      }[] = [];
      questionsAndAnswers.map((secretAnswer) => {
        questions.push({
          guid: secretAnswer.secretQuestion.guid,
          text: secretAnswer.secretQuestion.questionText
        });
      });
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
    }
  }

  @Post('pwr/:token')
  async compareAgainstSecretAnswersPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    const token = params.token;
    const { answer1, answer2, guid, question1, question2 } = req.body;
    const exactMatch1 = await this.userService.compareSecretAnswers(guid, question1, answer1);
    const exactMatch2 = await this.userService.compareSecretAnswers(guid, question2, answer2);
    if (exactMatch1 && exactMatch2) {
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
      // TODO: would be cool to have a service that logged and kept track of incorrect answers to then
      // lock someone's account if they answer too many times incorrectly
      res.send('Incorrect answer');
    }
    debugger;
  }

  @Post('npw/:token')
  async newPasswordPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    const resetRequest = await this.userService.passwordResetRepo.findByKeyShallow('token', params.token);
    const user = await this.userService.userRepo.findByKeyShallow('guid', resetRequest.userGuid);
    user.password = hashSync(req.body.newPassword, SHA1HashUtils.SALT_ROUNDS);
    user.updatedAt = new Date().toISOString();
    this.userService.userRepo.save(user);
    Mailer.sendPasswordResetConfirmationEmail(user.email);
    res.redirect('/');
  }
}

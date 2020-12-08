import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Post,
  HttpException,
  HttpStatus,
  Body,
  UseGuards,
  Delete,
  Patch
} from '@nestjs/common';

import { Request, Response } from 'express';
import { authenticator } from 'otplib';

import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { urlFragment, urlHas } from '../../utils/web/url-utils';
import { User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';

// @UseGuards(AdminRoleGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  public async usersAllGet() {
    return this.userService.userRepo.find({
      relations: ['account']
    });
  }

  @Get(':guid')
  public async userGet(@Param() params) {
    return this.userService.userRepo.findOne({
      where: {
        guid: params.guid
      },
      relations: ['account']
    });
  }

  @Delete(':guid')
  public async deleteUser(@Param() params) {
    const userGuid = params.guid;
    return this.userService.removeUser(userGuid);
  }

  @Patch()
  public async updateUser(@Body() body) {
    const updatedUser: Partial<User> = {
      ...body
    };
    return this.userService.updateUser(updatedUser);
    // return updatedUser;
  }

  /**
   * Function that will load the 'register' view.
   * Will prompt user for name, email, pw, and secret answers
   *
   */
  @Get('register')
  public async registerGet(@Req() req: Request, @Res() res: Response) {
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
      if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

      res.render('_registration-layout', {
        ...locals,
        body: html
      });
    });
  }

  /**
   * The 'register' view has a form that will post to this route.
   * This route will insert a new User entity
   *
   */
  @Post('register')
  public async registerPost(@Body() body, @Req() req: Request, @Res() res: Response) {
    try {
      const _user: Partial<User> = {
        email: body.email,
        password: body.password,
        signup_ip_address: req.ip,
        last_used_ip_address: req.ip,
        updatedAt: new Date(),
        added: new Date()
      };
      const user = await this.userService.userRepo.create(_user);
      const userEnt = await this.userService.insertUser(user, body.name);
      const { secretanswer1, secretanswer2, secretQuestion1, secretQuestion2 } = body;

      await this.userService.insertSecretAnswers(secretQuestion1, secretQuestion2, secretanswer1, secretanswer2, userEnt);

      return res.send(`Welcome aboard, ${userEnt.account.name}!`);
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  /**
   * Sends an email to the user for them to "verify" their email address
   *
   */
  @Get('register/:guid')
  public async registerConfirmedGet(@Param() params, @Res() res: Response) {
    this.userService.userVerifiedEmail(params.guid);

    return res.redirect('/');
  }

  /**
   * Enables 2FA for a given user. Will generate a new 2FA QR code and display it in a view
   * for the user to scan.
   */
  @Post('2fa/enable')
  public async enable2faPost(@Body() body, @Res() res: Response) {
    if (body.guid) {
      const user = await this.userService.userRepo.findOne({
        where: {
          guid: body.guid
        }
      });

      if (user.enabled2fa) {
        return res.send({
          error: '2FA already enabled for user'
        });
      }

      await this.userService.enable2FA(user);

      if (user.enabled2fa) {
        const issuer = 'GeoInnovation Service Center';
        const otpPath = authenticator.keyuri(encodeURIComponent(user.email), issuer, user.secret2fa);

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

  @Get('2fa/enable/:guid')
  public async enable2faGet(@Param() params, @Res() res: Response) {
    const userGuid = params.guid;
    if (userGuid) {
      const user = await this.userService.userRepo.findOne({
        where: {
          guid: userGuid
        }
      });

      if (user.enabled2fa) {
        return res.send({
          error: '2FA already enabled for user'
        });
      }

      await this.userService.enable2FA(user);

      if (user.enabled2fa) {
        const issuer = 'GeoInnovation Service Center';
        const otpPath = authenticator.keyuri(encodeURIComponent(user.email), issuer, user.secret2fa);

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

  /**
   * Simply sets the user attribute "enabled2fa" to false and removes the secret
   */
  @Post('2fa/disable')
  public async disable2faPost(@Body() body, @Res() res: Response) {
    if (body.guid) {
      const disable2fa = await this.userService.disable2fa(body.guid);

      if (disable2fa) {
        return res.sendStatus(200);
      }
    }
  }

  /**
   * Assigns a role to a user for a particular clientId.
   * Will save newly created UserRole entity object
   */
  @Post('role')
  public async addUserRolePost(@Body() body, @Req() req: Request) {
    const { email } = body;

    const existingUser = await this.userService.userRepo.findOne({
      where: {
        email: email
      }
    });

    if (existingUser) {
      const roles = await this.userService.roleRepo.find();

      const requestedRole = roles.find((value, index) => {
        if (req.body.role.level === value.level) {
          return value;
        }
      });

      await this.userService.insertUserRole(existingUser, requestedRole, body.client.name);
    }
  }

  @Get('pwr')
  public async userForgotPasswordGet(@Res() res: Response) {
    const locals = {
      title: 'GeoInnovation Service Center SSO',
      client: {},
      debug: false,
      details: {},
      params: {},
      interaction: true,
      error: false
    };

    return res.render('forgot-password', locals, (err, html) => {
      if (err) throw err;
      res.render('_password-reset-layout', {
        ...locals,
        body: html
      });
    });
  }

  /**
   * Sends an email with a magic link to the user
   * Post body needs "guid" key which is the USER guid of the person
   * or "email"
   */
  @Post('pwr')
  public async userForgotPasswordPost(@Body() body, @Req() req: Request, @Res() res: Response) {
    const { guid, email } = body;

    await this.userService.sendPasswordResetEmail(guid, email, req.ip);

    const locals = {
      title: 'GeoInnovation Service Center SSO',
      client: {},
      debug: false,
      details: {},
      params: {},
      interaction: true,
      error: false,
      email: body.email
    };

    return res.render('email-was-sent', locals, (err, html) => {
      if (err) throw err;

      res.render('_password-reset-layout', {
        ...locals,
        body: html
      });
    });
  }

  /**
   * The email from "userForgotPasswordPost" will take the user here.
   * Loads a view where we display the user's secret questions
   */
  @Get('pwr/:token')
  public async loadAppropriatePWRViewGet(@Param() params, @Res() res: Response) {
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
        if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

        res.render('_password-reset-layout', {
          ...locals,
          body: html
        });
      });
    } else {
      return res.send('This link is no longer valid');
    }
  }

  /**
   * The form from "loadAppropriatePWRViewGet" will come here.
   * Checks to see if the answers from "loadAppropriatePWRViewGet" match the hashes we have.
   * If everything is okay we show them the "new-password" view
   */
  @Post('pwr/:token')
  public async compareAgainstSecretAnswersPost(@Param() params, @Body() body, @Res() res: Response) {
    if (this.userService.isPasswordResetTokenStillValid(params.token)) {
      const { answer1, answer2, guid, question1, question2 } = body;

      const answersAreCorrect = await this.userService.areSecretAnswersCorrect(answer1, answer2, guid, question1, question2);
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
            guid: body.guid
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
          guid: body.guid,
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

  /**
   * "compareAgainstSecretAnswersPost"'s form will come here.
   * Will check to see if the password passes validation (InputValidationMiddleware)
   * then it will update the password IF it hasn't been used already
   */
  @Post('npw/:token')
  public async newPasswordPost(@Param() params, @Body() body, @Res() res: Response) {
    const updatedPassword = await this.userService.ifNewUpdatePassword(body.newPassword, params.token);

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

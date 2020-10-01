import { Controller, Get, Param, Req, Res, Post, Delete, Patch, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { authenticator } from 'otplib';
import { urlFragment, urlHas } from '@tamu-gisc/oidc/utils';
import { User } from '@tamu-gisc/oidc/provider-nestjs';
import { UserService, ServiceToControllerTypes } from '../../services/user/user.service';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

@UseGuards(AdminRoleGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('one/:userGuid')
  async userGet(@Param() params) {
    const user = await this.userService.getUser(params.userGuid);
    if (user) {
      return user;
    } else {
      return this.userService.getUser(params.userGuid);
    }
  }

  @Get('all')
  async usersAllGet() {
    return this.userService.userRepo.findAllDeep();
  }

  @Delete('delete/:userGuid')
  async userDelete(@Param() params) {
    return this.userService.deleteUser(params.userGuid);
  }

  @Patch('update')
  async updateUserPatch(@Req() req: Request) {
    return this.userService.updateUser(req);
  }

  /**
   * Function that will load the 'register' view.
   * Will prompt user for name, email, pw, and secret answers
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
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

  /**
   * The 'register' view has a form that will post to this route.
   * This route will insert a new User entity
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
  @Post('register')
  async registerPost(@Req() req: Request, @Res() res: Response) {
    req.body.ip = req.ip;
    const newUser = await this.userService.insertUser(req);
    return res.send(`Welcome aboard, ${newUser.account.name}!`);
  }

  // @Get('register/:guid')
  // async registerConfirmedGet(@Param() params, @Res() res: Response) {
  //   this.userService.userVerifiedEmail(params.guid);
  //   return res.redirect('/');
  // }

  // @Post('2fa/enable')
  // async enable2faGet(@Param() params, @Req() req: Request, @Res() res: Response) {
  //   if (req.body.guid) {
  //     const enable2fa = await this.userService.enable2FA(req.body.guid);
  //     if (enable2fa == ServiceToControllerTypes.CONDITION_ALREADY_TRUE) {
  //       return res.send({
  //         error: '2FA already enabled for user'
  //       });
  //     }
  //     if (enable2fa) {
  //       const issuer = 'GeoInnovation Service Center';
  //       const otpPath = authenticator.keyuri(
  //         encodeURIComponent((enable2fa as User).email),
  //         issuer,
  //         (enable2fa as User).secret2fa
  //       );
  //       return res.render('2fa-scan', {
  //         title: 'Two-factor Authentication',
  //         otpPath: JSON.stringify(otpPath)
  //       });
  //     }
  //   } else {
  //     return res.send({
  //       error: 'No guid provided'
  //     });
  //   }
  // }

  /**
   * Simply sets the user attribute "enabled2fa" to false and removes the secret
   *
   * @param {Request} req
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
  @Post('2fa/disable')
  async disable2faPost(@Req() req: Request, @Res() res: Response) {
    if (req.body.guid) {
      const disable2fa = await this.userService.disable2fa(req.body.guid);
      if (disable2fa) {
        return res.sendStatus(200);
      }
    }
  }

  /**
   * Assigns a role to a user for a particular clientId.
   * Will save newly created UserRole entity object
   *
   * @param {Request} req
   * @memberof UserController
   */
  @Post('role')
  async addUserRolePost(@Req() req: Request) {
    this.userService.insertUserRole(req);
  }

  @Patch('role')
  async updateUserRolePost(@Req() req: Request) {
    // const joe = req;
    this.userService.updateUserRole(req);
    // return {
    //   greetings: 'HI'
    // };
  }

  @Get('pwr')
  async userForgotPasswordGet(@Req() req: Request, @Res() res: Response) {
    // return res.render('forgot-password');
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

  // /**
  //  * Sends an email with a magic link to the user
  //  * Post body needs "guid" key which is the USER guid of the person
  //  * or "email"
  //  *
  //  * @param {Request} req
  //  * @memberof UserController
  //  */
  // @Post('pwr')
  // async userForgotPasswordPost(@Req() req: Request, @Res() res: Response) {
  //   await this.userService.sendPasswordResetEmail(req);
  //   const locals = {
  //     title: 'GeoInnovation Service Center SSO',
  //     client: {},
  //     debug: false,
  //     details: {},
  //     params: {},
  //     interaction: true,
  //     error: false,
  //     email: req.body.email
  //   };
  //   return res.render('email-was-sent', locals, (err, html) => {
  //     if (err) throw err;
  //     res.render('_password-reset-layout', {
  //       ...locals,
  //       body: html
  //     });
  //   });
  // }

  /**
   * The email from "userForgotPasswordPost" will take the user here.
   * Loads a view where we display the user's secret questions
   *
   * @param {*} params
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
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

  /**
   * The form from "loadAppropriatePWRViewGet" will come here.
   * Checks to see if the answers from "loadAppropriatePWRViewGet" match the hashes we have.
   * If everything is okay we show them the "new-password" view
   *
   * @param {*} params
   * @param {Request} req
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
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

  /**
   * "compareAgainstSecretAnswersPost"'s form will come here.
   * Will check to see if the password passes validation (InputValidationMiddleware)
   * then it will update the password IF it hasn't been used already
   *
   * @param {*} params
   * @param {Request} req
   * @param {Response} res
   * @returns
   * @memberof UserController
   */
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

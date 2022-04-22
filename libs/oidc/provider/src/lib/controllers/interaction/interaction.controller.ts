import { Body, Controller, Get, Param, Req, Res, Post, HttpException, HttpStatus } from '@nestjs/common';

import { Request, Response } from 'express';
import { InteractionResults } from 'oidc-provider';
import * as otplib from 'otplib';

import { urlHas, urlFragment, UserService, Mailer, TwoFactorAuthUtils } from '@tamu-gisc/oidc/common';

import { OidcProviderService } from '../../services/provider/provider.service';

@Controller('interaction')
export class InteractionController {
  constructor(private providerService: OidcProviderService, private userService: UserService) {}

  @Get(':uid')
  public async interactionGet(@Req() req: Request, @Res() res: Response) {
    try {
      const { uid, prompt, params, session } = await this.providerService.provider.interactionDetails(req, res);
      const client = await this.providerService.provider.Client.find(params.client_id as string);

      const name = prompt.name;

      switch (name) {
        case 'login': {
          const locals = {
            params,
            details: prompt.details,
            error: false,
            interaction: true,
            devMode: urlHas(req.path, 'dev', true),
            requestingHost: urlFragment(client.redirectUris[0], 'hostname')
          };

          return res.render('user-info', locals, (err, html) => {
            if (err) throw err;
            res.render('_layout', {
              ...locals,
              body: html
            });
          });
        }

        case 'consent': {
          return res.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
            session: session ? console.log(session) : undefined
          });
        }

        default: {
          throw new HttpException('Unknown prompt type', HttpStatus.BAD_REQUEST);
        }
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.PARTIAL_CONTENT);
    }
  }

  @Post(':uid')
  public async loginPost(@Body() body, @Req() req, @Res() res) {
    const details = await this.providerService.provider.interactionDetails(req, res);
    const { prompt, params } = details;

    const client = await this.providerService.provider.Client.find(params.client_id as string);

    try {
      const {
        prompt: { name }
      } = details;

      const user = await this.userService.userLogin(body.email, body.password);

      let result: InteractionResults = {};

      if (user) {
        result = {
          login: {
            accountId: user.account.guid,
            remember: body.remember,
            name
          }
        };
      } else {
        throw new HttpException('Email / password combination unknown', HttpStatus.BAD_REQUEST);
      }

      await this.providerService.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      const locals = {
        params,
        details: prompt.details,
        error: true,
        message: err.message,
        interaction: true,
        devMode: urlHas(req.path, 'dev', true),
        requestingHost: urlFragment(client.redirectUris[0], 'hostname')
      };

      return res.render('user-info', locals, (err, html) => {
        if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

        res.render('_layout', {
          ...locals,
          body: html
        });
      });
    }
  }

  @Post(':uid/2fa/method')
  public async interaction2faMethod(@Body() body, @Req() req: Request, @Res() res: Response) {
    const details = await this.providerService.provider.interactionDetails(req, res);
    const user = await this.userService.userRepo.findByKeyDeep('guid', body.guid);

    // body.method is returned as an array for some reason
    const locals = {
      title: 'Sign-in',
      details: details,
      email: user.email,
      guid: user.guid,
      method: body.method[1],
      error: false
    };

    if (locals.method) {
      if (locals.method === 'totp') {
        const token = otplib.totp.generate(user.secret2fa);
        Mailer.sendTokenByEmail(user, token);
      }
    }

    return res.render('2fa-auth', locals, (err, html) => {
      if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

      res.render('_layout-simple', {
        ...locals,
        body: html
      });
    });
  }

  @Post(':uid/2fa')
  public async interaction2faPost(@Body() body, @Req() req: Request, @Res() res: Response) {
    const details = await this.providerService.provider.interactionDetails(req, res);
    const user = await this.userService.userRepo.findByKeyDeep('guid', body.guid);

    try {
      const inputToken = body.token;

      const isValid = await TwoFactorAuthUtils.isValid(inputToken, user.secret2fa, body.method);

      if (isValid) {
        const result: InteractionResults = {
          select_account: {},
          login: {
            accountId: user.account.guid,
            acr: 'urn:mace:incommon:iap:bronze',
            amr: ['pwd'],
            remember: true,
            ts: Math.floor(Date.now() / 1000)
          },
          // consent was given by the user to the client for this session
          consent: {
            rejectedScopes: [], // array of strings, scope names the end-user has not granted
            rejectedClaims: [] // array of strings, claim names the end-user has not granted
          },
          meta: {}
        };

        await this.providerService.provider.interactionFinished(req, res, result);
      } else {
        // Incorrect code provided
        throw new HttpException('Token provided was incorrect; please try again', HttpStatus.BAD_REQUEST);
      }
    } catch (err) {
      const locals = {
        title: 'Sign-in',
        details: details,
        email: user.email,
        guid: user.guid,
        method: body.method,
        error: true,
        message: err.message,
        result: JSON.stringify(body.result)
      };

      return res.render('2fa-auth', locals, (err, html) => {
        if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

        res.render('_layout-simple', {
          ...locals,
          body: html
        });
      });
    }
  }

  @Post(':uid/continue')
  public continuePost(@Param() params) {
    console.log(':uid/continue', 'continuePost', params);
  }

  @Post(':uid/confirm')
  public async confirmPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    try {
      const interactionDetails = await this.providerService.provider.interactionDetails(req, res);
      const {
        prompt: { name, details },
        params,
        session: { accountId }
      } = interactionDetails;
      // assert.equal(name, 'consent');

      let { grantId } = interactionDetails;
      let grant;

      if (grantId) {
        // we'll be modifying existing grant in existing session
        grant = await this.providerService.provider.Grant.find(grantId);
      } else {
        // we're establishing a new grant
        grant = new this.providerService.provider.Grant({
          accountId,
          clientId: params.client_id as string
        });
      }

      if (details.missingOIDCScope) {
        grant.addOIDCScope((details.missingOIDCScope as string[]).join(' '));
      }
      if (details.missingOIDCClaims) {
        grant.addOIDCClaims(details.missingOIDCClaims);
      }
      if (details.missingResourceScopes) {
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
          grant.addResourceScope(indicator, (scopes as Array<string>).join(' '));
        }
      }

      grantId = await grant.save();

      const consent = {};
      if (!interactionDetails.grantId) {
        // we don't have to pass grantId to consent, we're just modifying existing one
        consent['grantId'] = grantId;
      }

      const result = { consent };
      await this.providerService.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
    } catch (err) {
      return err;
    }
  }

  @Post(':uid/abort')
  public abortPost(@Param() params) {
    console.log(':uid/abort', 'abortPost', params);
  }

  @Get('logout')
  public logoutGet(@Body() body) {
    if (body) {
      if (body.id_token_hint) {
        const { post_logout_redirect_uris } = body;

        console.warn('interaction/logout', post_logout_redirect_uris);
      }
    }
  }
}

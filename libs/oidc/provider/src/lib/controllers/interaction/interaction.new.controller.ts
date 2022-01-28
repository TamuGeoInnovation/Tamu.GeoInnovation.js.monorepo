import { Body, Controller, Get, Param, Req, Res, Post, HttpException, HttpStatus } from '@nestjs/common';

import { Request, Response } from 'express';
import { InteractionResults, Provider } from 'oidc-provider';

import { urlHas, urlFragment, UserService } from '@tamu-gisc/oidc/common';

import { OidcProviderService } from '../../services/provider/provider.service';

@Controller('interaction')
export class InteractionController {
  constructor(private providerService: OidcProviderService) {}

  @Get(':uid')
  public async interactionGet(@Req() req: Request, @Res() res: Response) {
    try {
      const provider = await this.providerService.provider;
      const { uid, prompt, params, session } = await this.providerService.provider.interactionDetails(req, res);
      const client = await this.providerService.provider.Client.find(params.client_id);

      const name = prompt.name;

      switch (name) {
        case 'login': {
          console.log('login');
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
          console.log('consent', uid);
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
    try {
      const {
        prompt: { name }
      } = await this.providerService.provider.interactionDetails(req, res);
      const result = {
        login: {
          accountId: 'atharmon@tamu.edu',
          name
        }
      };

      await this.providerService.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
    } catch (err) {
      throw err;
    }
  }

  @Post(':uid/login')
  public async interactionLoginPost(@Body() body, @Req() req: Request, @Res() res: Response) {
    await this.providerService.provider.setProviderSession(req, res, {
      account: 'accountId'
    });

    const details = await this.providerService.provider.interactionDetails(req, res);
    const { prompt, params } = details;
    const client = await this.providerService.provider.Client.find(params.client_id);

    try {
      const email = body.email;
      const password = body.password;

      const result: InteractionResults = {
        select_account: {},
        login: {
          account: 'CHANGEME', // TODO: Make this the acutal account guid
          acr: 'urn:mace:incommon:iap:bronze',
          amr: ['pwd'],
          remember: true,
          ts: Math.floor(Date.now() / 1000)
        },
        // consent was given by the user to the client for this session
        consent: {
          rejectedScopes: ['profile'], // array of strings, scope names the end-user has not granted
          rejectedClaims: [] // array of strings, claim names the end-user has not granted
        },
        meta: {}
      };

      // this.loginService.insertUserLogin(req);
      await this.providerService.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
      // const user = await this.userService.userLogin(email, password);

      // if (user) {
      //   if (user.enabled2fa) {
      //     const locals = {
      //       title: 'Sign-in',
      //       details: details,
      //       email: user.email,
      //       guid: user.guid,
      //       error: false
      //     };

      //     return res.render('2fa-choose', locals, (err, html) => {
      //       if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

      //       res.render('_layout-simple', {
      //         ...locals,
      //         body: html
      //       });
      //     });
      //   } else {
      //     const result: InteractionResults = {
      //       select_account: {},
      //       login: {
      //         account: user.account.guid,
      //         acr: 'urn:mace:incommon:iap:bronze',
      //         amr: ['pwd'],
      //         remember: true,
      //         ts: Math.floor(Date.now() / 1000)
      //       },
      //       // consent was given by the user to the client for this session
      //       consent: {
      //         rejectedScopes: ['profile'], // array of strings, scope names the end-user has not granted
      //         rejectedClaims: [] // array of strings, claim names the end-user has not granted
      //       },
      //       meta: {}
      //     };

      //     // this.loginService.insertUserLogin(req);
      //     await this.providerService.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
      //   }
      // } else {
      //   // could not get user; render some error page or redirect to registration
      //   throw new HttpException('Email / password combination unknown', HttpStatus.BAD_REQUEST);
      // }
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

  @Post(':uid/continue')
  public continuePost(@Param() params) {
    console.log(':uid/continue', 'continuePost', params);
  }

  @Post(':uid/confirm')
  public async confirmPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    console.log(':uid/confirm', 'confirmPost', params);
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
          clientId: params.client_id
        });
      }

      if (details.missingOIDCScope) {
        grant.addOIDCScope(details.missingOIDCScope.join(' '));
      }
      if (details.missingOIDCClaims) {
        grant.addOIDCClaims(details.missingOIDCClaims);
      }
      if (details.missingResourceScopes) {
        // eslint-disable-next-line no-restricted-syntax
        for (const [indicator, scopes] of Object.entries(details.missingResourceScopes)) {
          grant.addResourceScope(indicator, scopes.join(' '));
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

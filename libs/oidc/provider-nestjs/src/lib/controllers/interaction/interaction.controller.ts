import { Controller, Get, Param, Req, Res, Post, HttpException, HttpStatus } from '@nestjs/common';

import { Request, Response } from 'express';
import got from 'got';
import { InteractionResults } from 'oidc-provider';

import { OpenIdProvider } from '../../configs/oidc-provider-config';
import { User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';
import { urlHas, urlFragment } from '../../_utils/url-utils';
import { TwoFactorAuthUtils } from '../../_utils/twofactorauth.util';
import { UserLoginService } from '../../services/user-login/user-login.service';

@Controller('interaction')
export class InteractionController {
  constructor(private readonly userService: UserService, private readonly loginService: UserLoginService) {}

  @Get(':uid')
  public async interactionGet(@Req() req: Request, @Res() res: Response) {
    try {
      const { uid, prompt, params, session } = await OpenIdProvider.provider.interactionDetails(req, res);
      const client = await OpenIdProvider.provider.Client.find(params.client_id);

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
  public async interactionLoginPost(@Req() req: Request, @Res() res: Response) {
    await OpenIdProvider.provider.setProviderSession(req, res, {
      account: 'accountId'
    });

    const details = await OpenIdProvider.provider.interactionDetails(req, res);
    const { prompt, params } = details;
    const client = await OpenIdProvider.provider.Client.find(params.client_id);

    try {
      const email = req.body.email;
      const password = req.body.password;
      const user = await this.userService.userLogin(email, password);
      if (user) {
        if (user.enabled2fa) {
          const locals = {
            title: 'Sign-in',
            details: details,
            email: user.email,
            guid: user.guid,
            error: false
          };

          return res.render('2fa-auth', locals, (err, html) => {
            if (err) throw new HttpException(err, HttpStatus.BAD_REQUEST);

            res.render('_layout-simple', {
              ...locals,
              body: html
            });
          });
        } else {
          const result: InteractionResults = {
            select_account: {},
            login: {
              account: user.account.guid,
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
            meta: {
              test: {
                greetings: 'hello'
              }
            }
          };

          this.loginService.insertUserLogin(req);
          await OpenIdProvider.provider.interactionFinished(req, res, result, { mergeWithLastSubmission: false });
        }
      } else {
        // could not get user; render some error page or redirect to registration
        // throw new Error('Email / password combination unknown');
        throw new HttpException('Email / password combination unknown', HttpStatus.BAD_REQUEST);
      }
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

  @Post(':uid/2fa')
  public async interaction2faPost(@Req() req: Request, @Res() res: Response) {
    const details = await OpenIdProvider.provider.interactionDetails(req, res);
    const user = await this.userService.userRepo.findByKeyDeep('guid', req.body.guid);

    try {
      const inputToken = req.body.token;
      const isValid = await TwoFactorAuthUtils.isValid(inputToken, user.secret2fa);

      if (isValid) {
        const result: InteractionResults = {
          select_account: {},
          login: {
            account: user.account.guid,
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
        await OpenIdProvider.provider.interactionFinished(req, res, result);
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
        error: true,
        message: err.message,
        result: JSON.stringify(req.body.result)
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
  public confirmPost(@Param() params) {
    console.log(':uid/confirm', 'confirmPost', params);
  }

  @Post(':uid/abort')
  public abortPost(@Param() params) {
    console.log(':uid/abort', 'abortPost', params);
  }

  @Get('logout')
  public logoutGet(@Req() req: Request) {
    if (req) {
      if (req.body) {
        if (req.body.id_token_hint) {
          const { post_logout_redirect_uris } = req.body;

          got(post_logout_redirect_uris)
            .then((result) => {
              console.log(result);
            })
            .catch((err) => {
              throw new HttpException(err, HttpStatus.BAD_REQUEST);
            });
        }
      }
    }
  }
}

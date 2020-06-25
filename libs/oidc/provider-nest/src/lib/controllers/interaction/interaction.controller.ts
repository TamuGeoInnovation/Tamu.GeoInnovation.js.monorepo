import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import got from 'got';
import { OpenIdProvider } from '../../configs/oidc-provider-config';
import { User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';
import { JwtUtil } from '../../_utils/jwt.util';
import { InteractionResults } from 'oidc-provider';

@Controller('interaction')
export class InteractionController {
  constructor(private readonly userService: UserService) {}

  @Get(':uid')
  async interactionGet(@Req() req: Request, @Res() res: Response) {
    try {
      const { uid, prompt, params, session } = await OpenIdProvider.provider.interactionDetails(req, res);
      const client = await OpenIdProvider.provider.Client.find(params.client_id);

      const name = prompt.name;
      switch (name) {
        case 'login': {
          return res.render('login', {
            client,
            uid,
            params,
            details: prompt.details,
            title: 'GISC Identity Portal',
            debug: false,
            interaction: true
          });
          break;
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
          break;
        }
        default: {
          throw new Error('Unknown prompt type');
        }
      }
    } catch (err) {
      throw err;
    } finally {

    }
  }

  @Post(':uid')
  async interactionLoginPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    console.log('secondStep');
    await OpenIdProvider.provider.setProviderSession(req, res, {
      account: 'accountId'
    });
    const details = await OpenIdProvider.provider.interactionDetails(req, res);
    const client = await OpenIdProvider.provider.Client.find(details.params.client_id);

    try {
        const email = req.body.login;
        const password = req.body.password;
        const user: User = await UserService.userLogin(email, password);
        if (user) {
          const result: InteractionResults = {
            login: {
              account: user.guid,
              acr: "urn:mace:incommon:iap:bronze",
              amr: ["pwd"],
              remember: true,
              ts: Math.floor(Date.now() / 1000),
            },
            consent: {},
          };
          if (user.enabled2fa) {
            return res.render("2fa-auth", {
              client,
              details,
              email: user.email,
              guid: user.guid,
              error: false,
              title: "Sign-in",
              result: JSON.stringify(result),
              params: {},
              interaction: {},
              debug: false,
            });
          } else {
            await OpenIdProvider.provider.interactionFinished(req, res, result);
          }
        } else {
          // could not get user; render some error page or redirect to registration
        }
    } catch (err) {
      throw err;
    } finally {

    }
  }

  // @Post(':grant/login')
  // async thirdStep(@Param() params, @Req() req: Request, @Res() res: Response) {
  //   console.log('thirdStep');
  //   await OpenIdProvider.provider.setProviderSession(req, res, {
  //     account: 'accountId'
  //   });
  // }

  @Post(':uid/continue')
  async continuePost(@Param() params, @Req() req: Request, @Res() res: Response) {
    debugger
  }

  @Post(':uid/confirm')
  async confirmPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    debugger
  }

  @Post(':uid/abort')
  async abortPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    debugger
  }

  @Get('logout')
  async logoutGet(@Param() params, @Req() req: Request, @Res() res: Response) {
    if (req) {
      if (req.body) {
        if (req.body.id_token_hint) {
          const { id_token_hint, post_logout_redirect_uris } = req.body;
          JwtUtil.generateLogoutToken(id_token_hint);
          got(post_logout_redirect_uris)
            .then((result) => {
              console.log(result);
            })
            .catch((err) => {
              console.error(err);
              throw err;
            });
        }
      }
    }
  }
}

import { Controller, Get, Next, Param, Req, Res, Render, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { OpenIdProvider } from '../../configs/oidc-provider-config';
import { User } from '../../entities/all.entity';
import { UserService } from '../../services/user/user.service';

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
  async interactionPost(@Param() params, @Req() req: Request, @Res() res: Response) {
    console.log('secondStep');
    await OpenIdProvider.provider.setProviderSession(req, res, {
      account: 'accountId'
    });
    const details = await OpenIdProvider.provider.interactionDetails(req, res);
    const client = await OpenIdProvider.provider.Client.find(details.params.client_id);

    try {
        const email = req.body.login;
        const password = req.body.password;
        // const user: User = await this.userService
    } catch (err) {
      throw err;
    } finally {

    }
  }

  @Post(':grant/login')
  async thirdStep(@Param() params, @Req() req: Request, @Res() res: Response) {
    console.log('thirdStep');
    await OpenIdProvider.provider.setProviderSession(req, res, {
      account: 'accountId'
    });
  }
}

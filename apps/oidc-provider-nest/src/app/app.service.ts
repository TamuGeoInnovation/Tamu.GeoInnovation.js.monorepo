import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';

import { OpenIdProvider } from '@tamu-gisc/oidc/provider-nestjs';
import { UserService } from '@tamu-gisc/oidc/common';

@Injectable()
export class AppService {
  constructor(private readonly userService: UserService) {}

  public async getSignedInAccount(req: Request, res: Response) {
    const ctx = OpenIdProvider.provider.app.createContext(req, res);
    const session = await OpenIdProvider.provider.Session.get(ctx);
    return this.userService.accountRepo.findByKeyShallow('guid', session.account);
  }
}

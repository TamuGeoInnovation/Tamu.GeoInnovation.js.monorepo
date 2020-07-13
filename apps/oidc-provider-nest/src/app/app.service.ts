import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { OpenIdProvider } from '@tamu-gisc/oidc/provider-nest';

@Injectable()
export class AppService {
  async getHello(req: Request, res: Response) {
    const ctx = OpenIdProvider.provider.app.createContext(req, res);
    const session = await OpenIdProvider.provider.Session.get(ctx);
    const signedIn = !!session.account;
    return `Hello ${session.account}!`;
  }
}

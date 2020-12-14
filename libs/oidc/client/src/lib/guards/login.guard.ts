import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OpenIdClient } from '../auth/open-id-client';
import { OidcClientModuleParameters } from '../auth/oidc-client.module';

/**
 * NestJS guard used to start the login process using the openid-client library.
 */
@Injectable()
export class LoginGuard extends AuthGuard(OpenIdClient.strategyName) {
  constructor(@Inject('HOST') public host: OidcClientModuleParameters['host']) {
    super();
  }
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.query && request.query.ret) {
      console.log('Setting return url to be: ', request.query.ret);
      request.session.returnUrl = request.query.ret;
    } else if (request.headers.referer) {
      if (this.host === undefined) {
        console.warn('IDP issuer host not provided. Can not register a return URL.');
      } else if (
        this.host !== undefined &&
        !this.host.includes(request.headers.referer) &&
        request.session &&
        request.session.returnUrl === undefined
      ) {
        console.log('Return URL', request.headers.referer);
        request.session.returnUrl = request.headers.referer;
      }
    } else {
      console.warn('Missing referrer. Will not redirect incoming request after successful authentication.');
    }

    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}

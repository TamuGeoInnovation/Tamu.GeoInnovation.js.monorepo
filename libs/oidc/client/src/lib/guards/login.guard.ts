import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { OpenIdClient } from '../auth/open-id-client';
import { OidcClientModuleParameters } from '../auth/oidc-client.module';

/**
 * NestJS guard used to start the login process using the openid-client library.
 *
 * @export
 * @class LoginGuard
 * @extends {AuthGuard(OpenIdClient.strategyName)}
 */
@Injectable()
export class LoginGuard extends AuthGuard(OpenIdClient.strategyName) {
  constructor(@Inject('HOST') public host: OidcClientModuleParameters['host']) {
    super();
  }
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // if (request.query && request.query.ret) {
    //   request.session.returnUrl = request.query.ret;
    // } else if (request.headers.referer) {
    //   if (this.host === undefined) {
    //     console.warn('IDP issuer host not provided. Can not register a return URL.');
    //   } else if (this.host !== undefined && !request.headers.referer.includes(this.host)) {
    //     request.session.returnUrl = request.headers.referer;
    //   }
    // } else {
    //   console.warn('Missing referrer. Will not redirect incoming request after successful authentication.');
    // }

    const result = (await super.canActivate(context)) as boolean;
    await super.logIn(request);
    return result;
  }
}

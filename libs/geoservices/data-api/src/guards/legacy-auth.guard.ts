import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import got from 'got';

/**
 * Guard to impersonate a user from the legacy WAP system.
 * This guard is used to authenticate users in the legacy system
 * and provide their details to the current request.
 *
 * It retrieves the user details from the legacy system using a cookie
 * and attaches the user information to the request object.
 *
 * If the user is authenticated, it returns true, allowing access to the route.
 * Otherwise, it returns false, denying access.
 */
@Injectable()
export class LegacyAuthGuard implements CanActivate {
  constructor(private readonly env: EnvironmentService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const rq = ctx.getRequest();
    const cookies = rq.headers.cookie;

    const request = await got
      .post(`${this.env.value('legacyApiUrl')}/wap.accounts.geoservices.tamu.edu/rest/userServices/getDetails/`, {
        method: 'GET',
        headers: {
          cookie: cookies,
          'content-type': 'application/json'
        }
      })
      .then((r) => JSON.parse(r.body));

    if (request && request.Guid) {
      rq.user = request;
      return true;
    }

    return false;
  }
}

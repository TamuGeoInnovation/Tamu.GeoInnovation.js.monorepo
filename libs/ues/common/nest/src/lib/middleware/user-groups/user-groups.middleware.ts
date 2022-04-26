import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import jwt_decode from 'jwt-decode';

import { OpenIdClient } from '@tamu-gisc/oidc/client';

import { ClientRoles } from '../../types/ues-common-types';

/**
 * Middleware that that maps the user claim group id's into an enum value to be used for guarding certain routes.
 */
@Injectable()
export class UserGroupsMiddleware implements NestMiddleware {
  constructor(@Inject('ROLES') private readonly roles: ClientRoles) {}
  public async use(req, res, next: () => void) {
    // Do not process if the token has already expired.
    if (req.user && req.user.access_token) {
      const expired = Date.now() > req.user.expires_at * 1000;

      if (!expired) {
        try {
          const userInfo = await OpenIdClient.client.userinfo(req.user.access_token);
          const id_token = jwt_decode(req.user.id_token) as { groups?: Array<string> };
          const groups = id_token?.groups;

          req.user.claims = userInfo;
          req.user.claims.groups = groups;

          if (this.roles && req.user.claims.groups) {
            // Match, map, and filter each of the provided roles with the user groups, to return only the key of the role,
            // and not the id.
            const roles = Object.entries(this.roles)
              .filter(([name, id]) => {
                if (req.user.claims.groups.includes(id)) {
                  return name;
                }
              })
              .map(([name]) => {
                return name;
              });

            // Overwrite the groups with the processed list of roles.
            req.user.claims.groups = roles;
          }
        } catch (err) {
          console.error(`Access token expired`, err);
        }
      }
    }

    next();
  }
}

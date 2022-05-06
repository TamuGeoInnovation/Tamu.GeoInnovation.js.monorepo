import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class NestAuthGuard implements CanActivate {
  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // TODO: Have this idpUrl come from the environment file
    const idpDevUrl = 'https://idp-dev.geoservices.tamu.edu/oidc/jwks';
    // const idpUrl = 'http://localhost:4001/oidc/jwks';

    const client = new JwksClient({
      jwksUri: idpDevUrl
    });

    const signingKey = await client.getSigningKey();
    const key = signingKey.getPublicKey();

    if (request.get('Authorization')) {
      const encodedToken = request.get('Authorization').split(' ')[1];

      if (encodedToken) {
        const decodedToken = await jwt.verify(encodedToken, key);
        if (decodedToken) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}

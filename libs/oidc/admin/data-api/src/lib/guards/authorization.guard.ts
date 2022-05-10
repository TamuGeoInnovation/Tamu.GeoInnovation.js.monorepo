import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';

import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(@Inject('JWKS_URL') private readonly jwks_url: string) {}

  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const client = new JwksClient({
      jwksUri: this.jwks_url
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


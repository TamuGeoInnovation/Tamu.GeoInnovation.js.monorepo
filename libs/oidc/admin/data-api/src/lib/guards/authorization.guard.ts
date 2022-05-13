import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

@Injectable()
export class OldAuthorizationGuard implements CanActivate {
  constructor(private readonly env: EnvironmentService) {}

  public async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const client = new JwksClient({
      jwksUri: this.env.value('jwksEndpoint')
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

import { DynamicModule, Module } from '@nestjs/common';

import { JwtStrategy } from '../../strategies/jwt/jwt.strategy';
import { JWKS_URL } from '../tokens/jwks_url.token';

@Module({})
export class AuthModule {
  public static forRoot(options: { jwksUrl: string }): DynamicModule {
    return {
      module: AuthModule,
      providers: [
        JwtStrategy,
        {
          provide: JWKS_URL,
          useValue: options.jwksUrl
        }
      ],
      global: true
    };
  }
}

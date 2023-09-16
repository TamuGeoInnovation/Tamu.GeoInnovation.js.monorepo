import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JWT_CONFIG, JwtConfig, JwtStrategy } from './strategies/jwt.strategy';

@Module({})
export class AuthorizationModule {
  public static forRoot(env: JwtConfig): DynamicModule {
    return {
      global: true,
      module: AuthorizationModule,
      providers: [
        JwtStrategy,
        {
          provide: JWT_CONFIG,
          useValue: env
        }
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      exports: [PassportModule]
    };
  }
}

import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JWT_CONFIG, JwtConfig, JwtStrategy } from '../authentication/strategies/jwt.strategy';
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({})
export class AuthorizationModule {
  public static forRoot(env: JwtConfig): DynamicModule {
    if (process.env.LOGGING) {
      console.log('Auth', env);
    }

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
      imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PermissionsModule],
      exports: [PassportModule]
    };
  }
}

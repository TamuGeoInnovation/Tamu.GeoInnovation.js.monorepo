import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JWT_CONFIG, JwtConfig, JwtStrategy } from '../authentication/strategies/jwt.strategy';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { MANAGEMENT_CONFIG, ManagementConfig, ManagementService } from './services/management/management.service';

@Module({})
export class AuthorizationModule {
  public static forRoot(config: { jwt: JwtConfig; management?: ManagementConfig }): DynamicModule {
    if (process.env.LOGGING) {
      console.log('Auth', config);
    }

    return {
      global: true,
      module: AuthorizationModule,
      providers: [
        {
          provide: JWT_CONFIG,
          useValue: {
            issuerUrl: config.jwt.issuerUrl,
            audience: config.jwt.audience
          }
        },
        {
          provide: MANAGEMENT_CONFIG,
          useValue: {
            domain: config.management.domain,
            clientId: config.management.clientId,
            clientSecret: config.management.clientSecret
          }
        },
        JwtStrategy,
        ManagementService
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PermissionsModule],
      exports: [PassportModule, ManagementService]
    };
  }
}

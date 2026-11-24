import { DynamicModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JWT_CONFIG, JwtConfig, JwtStrategy } from '../authentication/strategies/jwt.strategy';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { MANAGEMENT_CONFIG, ManagementConfig, ManagementService } from './services/management/management.service';

/**
 * The auth configuration as it may be logged (#1794): every field but the management client secret, which is reported
 * only as given or not. Logging the configuration itself wrote that secret into the log of any API started with
 * `LOGGING` set.
 */
export function authConfigForLog(config: { jwt: JwtConfig; management: ManagementConfig }) {
  const { clientSecret, ...management } = config.management;

  return { jwt: config.jwt, management: { ...management, clientSecret: clientSecret ? 'set' : 'not set' } };
}

@Module({})
export class AuthorizationModule {
  public static forRoot(config: { jwt: JwtConfig; management: ManagementConfig }): DynamicModule {
    if (process.env.LOGGING) {
      console.log('Auth', authConfigForLog(config));
    }

    return {
      global: true,
      module: AuthorizationModule,
      providers: [
        { provide: JWT_CONFIG, useValue: config.jwt },
        { provide: MANAGEMENT_CONFIG, useValue: config.management },
        JwtStrategy,
        ManagementService
      ],
      imports: [PassportModule.register({ defaultStrategy: 'jwt' }), PermissionsModule],
      exports: [PassportModule, ManagementService]
    };
  }
}

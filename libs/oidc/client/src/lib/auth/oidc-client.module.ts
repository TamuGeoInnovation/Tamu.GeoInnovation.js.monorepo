import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthStrategy } from './open-id-client';
import { SessionSerializer } from './session-serializer';
import { OidcClientController } from './oidc-client.controller';

@Module({
  imports: [
    PassportModule.register({
      session: true,
      // Passport 0.6 and later start a new session on login, which would drop the return URL that
      // LoginGuard stores in it before the redirect to the identity provider.
      keepSessionInfo: true
    })
  ],
  providers: [AuthStrategy, SessionSerializer],
  exports: [],
  controllers: [OidcClientController]
})
export class OidcClientModule {
  public static forRoot(params?: OidcClientModuleParameters) {
    return {
      module: OidcClientModule,
      providers: [
        {
          provide: 'HOST',
          useValue: params.host
        }
      ]
    };
  }
}

export interface OidcClientModuleParameters {
  /**
   * IDP Issuer URL. This value is provided as a provider which is used by guards to determine if
   * the request is being sent by the idp or the host application.
   */
  host?: string;
}

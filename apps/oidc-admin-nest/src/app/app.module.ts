import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcClientModule, OidcClientController, TokenExchangeMiddleware } from '@tamu-gisc/oidc/client';
import {
  AccessToken,
  Account,
  ClientMetadata,
  GrantType,
  ResponseType,
  TokenEndpointAuthMethod,
  RedirectUri,
  Role,
  UserRole,
  User,
  SecretQuestion,
  SecretAnswer,
  UserPasswordReset,
  UserPasswordHistory,
  ClientMetadataModule,
  RoleModule,
  UserModule
} from '@tamu-gisc/oidc/common';
import { AccessTokenModule, StatsModule } from '@tamu-gisc/oidc/admin-nest';

import { dbConfig } from '../environments/environment';
import { OIDC_IDP_ISSUER_URL } from '../environments/oidcconfig';

@Module({
  imports: [
    OidcClientModule.forRoot({
      host: OIDC_IDP_ISSUER_URL
    }),
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        AccessToken,
        Account,
        ClientMetadata,
        GrantType,
        ResponseType,
        RedirectUri,
        Role,
        SecretQuestion,
        SecretAnswer,
        TokenEndpointAuthMethod,
        UserRole,
        User,
        UserModule,
        UserPasswordReset,
        UserPasswordHistory
      ]
    }),
    AccessTokenModule,
    ClientMetadataModule,
    RoleModule,
    StatsModule,
    UserModule
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenExchangeMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientController);
  }
}

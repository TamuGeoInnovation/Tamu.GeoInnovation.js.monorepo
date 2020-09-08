import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OIDC_IDP_ISSUER_URL } from '../environments/oidcconfig';

import { OidcClientModule, OidcClientController, ClaimsMiddleware } from '@tamu-gisc/oidc/client';

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
  UserModule,
  SecretQuestion,
  SecretAnswer,
  UserPasswordReset,
  UserPasswordHistory
} from '@tamu-gisc/oidc/provider-nest';

import { AccessTokenModule, ClientMetadataModule, RoleModule, StatsModule } from '@tamu-gisc/oidc/admin-nest';

import { dbConfig } from '../environments/environment';

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
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClaimsMiddleware)
      .exclude(
        { path: 'oidc/login', method: RequestMethod.GET },
        { path: 'oidc/logout', method: RequestMethod.GET },
        { path: 'oidc/auth/callback', method: RequestMethod.GET }
      )
      .forRoutes(OidcClientController);
  }
}

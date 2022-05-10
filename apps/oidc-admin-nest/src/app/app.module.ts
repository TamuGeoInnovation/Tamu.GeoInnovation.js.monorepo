import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  UserModule,
  BackchannelLogoutUri,
  Client
} from '@tamu-gisc/oidc/common';
import { AccessTokenModule, StatsModule } from '@tamu-gisc/oidc/admin/data-api';

import { dbConfig, environment } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        Client,
        AccessToken,
        Account,
        BackchannelLogoutUri,
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
  providers: [
    {
      provide: 'JWKS_URL',
      useValue: environment.jwksEndpoint
    }
  ]
})
export class AppModule {}

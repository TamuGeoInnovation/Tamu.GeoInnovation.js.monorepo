import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Account,
  AccessToken,
  AuthorizationCode,
  Client,
  ClientCredential,
  DeviceCode,
  InitialAccessToken,
  Interaction,
  RefreshToken,
  RegistrationAccessToken,
  Session,
  Grant,
  BackchannelAuthenticationRequest,
  User,
  ClientMetadata,
  GrantType,
  RedirectUri,
  ResponseType,
  TokenEndpointAuthMethod,
  Role,
  UserRole,
  UserLogin,
  SecretQuestion,
  SecretAnswer,
  UserPasswordReset,
  UserPasswordHistory,
  PushedAuthorizationRequest,
  ReplayDetection,
  BackchannelLogoutUri
} from '@tamu-gisc/oidc/common';
import { InteractionModule, OidcModule } from '@tamu-gisc/oidc/provider';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        TokenEndpointAuthMethod,
        Account,
        AccessToken,
        AuthorizationCode,
        BackchannelLogoutUri,
        Client,
        ClientCredential,
        ClientMetadata,
        DeviceCode,
        GrantType,
        InitialAccessToken,
        Interaction,
        RedirectUri,
        RefreshToken,
        RegistrationAccessToken,
        ResponseType,
        Role,
        Session,
        Grant,
        BackchannelAuthenticationRequest,
        User,
        UserRole,
        UserLogin,
        SecretQuestion,
        SecretAnswer,
        UserPasswordReset,
        UserPasswordHistory,
        PushedAuthorizationRequest,
        ReplayDetection
      ],
      autoLoadEntities: true
    }),
    InteractionModule,
    OidcModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

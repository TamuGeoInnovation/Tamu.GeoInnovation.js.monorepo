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
  ClientMetadataModule,
  UserModule,
  RoleModule,
  SecretQuestionController,
  BackchannelLogoutUri
} from '@tamu-gisc/oidc/common';
import { AccessTokenModule, InteractionModule, UserLoginModule } from '@tamu-gisc/oidc/provider';

import { AppController } from './app.controller';
import { AppService } from './app.service';
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
    AccessTokenModule,
    InteractionModule,
    ClientMetadataModule,
    RoleModule,
    UserModule,
    UserLoginModule
  ],
  controllers: [AppController, SecretQuestionController],
  providers: [AppService]
})
export class AppModule {}

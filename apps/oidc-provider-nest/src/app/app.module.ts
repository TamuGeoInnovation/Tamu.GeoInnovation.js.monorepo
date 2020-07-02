import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
  InteractionModule,
  UserModule,
  ClientMetadataModule,
  ClientMetadata,
  GrantType,
  ClientMetadataRepo,
  GrantTypeRepo,
  RedirectUri,
  ResponseType,
  TokenEndpointAuthMethod,
  TokenEndpointAuthMethodRepo,
  Role
} from '@tamu-gisc/oidc/provider-nest';

import { dbConfig } from '../environments/environment';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...dbConfig,
      entities: [
        Account,
        AccessToken,
        AuthorizationCode,
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
        TokenEndpointAuthMethod,
        User
      ]
    }),
    // AuthModule,
    InteractionModule,
    ClientMetadataModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
  constructor(private connection: Connection) {}
}

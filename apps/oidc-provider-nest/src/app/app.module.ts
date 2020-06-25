import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  UserModule
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
        DeviceCode,
        InitialAccessToken,
        Interaction,
        RefreshToken,
        RegistrationAccessToken,
        Session,
        User
      ]
    }),
    InteractionModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

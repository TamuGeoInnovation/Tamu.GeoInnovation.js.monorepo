import { Module } from '@nestjs/common';
// import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { join } from 'path';

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

console.log("THIS IS THE PATH: ", join(__dirname, 'assets', 'styles' ));

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    // }),
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

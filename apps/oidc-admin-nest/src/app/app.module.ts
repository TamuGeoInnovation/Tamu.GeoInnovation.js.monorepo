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
import { ClientModule, StatsModule } from '@tamu-gisc/oidc/admin/data-api';
import { EnvironmentModule } from '@tamu-gisc/common/nest/environment';

import { dbConfig, environment } from '../environments/environment';

@Module({
  imports: [
    EnvironmentModule.forRoot(environment),
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
    ClientMetadataModule,
    RoleModule,
    StatsModule,
    ClientModule,
    UserModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

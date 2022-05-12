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
  RoleModule,
  UserModule,
  BackchannelLogoutUri,
  Client,
  NewUserRole,
  UserRoleModule
} from '@tamu-gisc/oidc/common';
import { ClientModule, StatsModule } from '@tamu-gisc/oidc/admin/data-api';
import { EnvironmentModule } from '@tamu-gisc/common/nest/environment';
import { AuthModule } from '@tamu-gisc/oidc/common';

import { dbConfig, environment } from '../environments/environment';

@Module({
  imports: [
    EnvironmentModule.forRoot(environment),
    AuthModule.forRoot({ jwksUrl: environment.jwksUrl }),
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
        UserPasswordHistory,
        NewUserRole
      ]
    }),
    RoleModule,
    StatsModule,
    ClientModule,
    UserModule,
    UserRoleModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}

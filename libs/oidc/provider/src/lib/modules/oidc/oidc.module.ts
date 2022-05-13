import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  AccountRepo,
  AccountService,
  ClientRepo,
  NewUserRoleRepo,
  RoleRepo,
  UserRepo,
  UserRoleService
} from '@tamu-gisc/oidc/common';

import { OidcProviderService } from '../../services/provider/provider.service';
import { OidcController } from '../../controllers/oidc/oidc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRepo, NewUserRoleRepo, ClientRepo, RoleRepo, UserRepo])],
  controllers: [OidcController],
  providers: [OidcProviderService, AccountService, UserRoleService],
  exports: [OidcProviderService, AccountService, UserRoleService]
})
export class OidcModule {}

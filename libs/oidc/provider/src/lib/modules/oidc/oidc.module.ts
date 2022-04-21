import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountRepo, AccountService, RoleRepo } from '@tamu-gisc/oidc/common';

import { OidcProviderService } from '../../services/provider/provider.service';
import { OidcController } from '../../controllers/oidc/oidc.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRepo, RoleRepo])],
  controllers: [OidcController],
  providers: [OidcProviderService, AccountService],
  exports: [OidcProviderService, AccountService]
})
export class OidcModule {}

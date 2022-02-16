import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OidcProviderService } from '../../services/provider/provider.service';
import { OidcController } from '../../controllers/oidc/oidc.controller';
import { AccountService } from '../../services/account/account.service';

import { AccountRepo, RoleRepo } from '../../../../../common/src/lib/entities/all.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRepo, RoleRepo])],
  controllers: [OidcController],
  providers: [OidcProviderService, AccountService],
  exports: [OidcProviderService, AccountService]
})
export class OidcModule {}

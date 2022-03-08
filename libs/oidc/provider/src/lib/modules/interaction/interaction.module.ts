import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule, UserService } from '@tamu-gisc/oidc/common';

import { InteractionController } from '../../controllers/interaction/interaction.new.controller';
import { UserLoginModule } from '../user-login/user-login.module';
import { OidcProviderService } from '../../services/provider/provider.service';
import { AccountRepo, RoleRepo } from '../../../../../common/src/lib/entities/all.entity';
import { OidcModule } from '../oidc/oidc.module';

@Module({
  imports: [OidcModule, UserModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}

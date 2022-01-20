import { Module } from '@nestjs/common';

import { UserModule, UserService } from '@tamu-gisc/oidc/common';

import { InteractionController } from '../../controllers/interaction/interaction.new.controller';
import { UserLoginModule } from '../user-login/user-login.module';
import { OidcProviderService } from '../../services/provider/provider.service';

@Module({
  // imports: [UserModule],
  imports: [],
  controllers: [InteractionController],
  providers: [OidcProviderService],
  exports: []
})
export class InteractionModule {}

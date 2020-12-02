import { Module } from '@nestjs/common';

import { UserModule } from '@tamu-gisc/oidc/common';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserLoginModule } from '../user-login/user-login.module';

@Module({
  imports: [UserModule, UserLoginModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}

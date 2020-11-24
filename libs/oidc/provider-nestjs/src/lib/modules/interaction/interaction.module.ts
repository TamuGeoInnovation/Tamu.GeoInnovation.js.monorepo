import { Module } from '@nestjs/common';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserLoginModule } from '../user-login/user-login.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, UserLoginModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}

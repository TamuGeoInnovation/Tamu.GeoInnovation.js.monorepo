import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { setPragmaAndCache } from '../../middleware/oidc/set-pragma-cache.middleware';
import { UserLoginModule } from '../user-login/user-login.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule, UserLoginModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(setPragmaAndCache).forRoutes('interaction');
  }
}

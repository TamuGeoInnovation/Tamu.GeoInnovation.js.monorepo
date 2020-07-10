import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserService } from '../../services/user/user.service';
import { setPragmaAndCache } from '../../middleware/set-pragma-cache.middleware';
import { UserModule } from '../user/user.module';
import { UserLoginModule } from '../user-login/user-login.module';
import { UserLoginService } from '../../services/user-login/user-login.service';

@Module({
  imports: [UserModule, UserLoginModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(setPragmaAndCache).forRoutes('interaction');
  }
}

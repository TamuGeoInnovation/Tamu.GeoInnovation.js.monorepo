import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserService } from '../../services/user/user.service';
import { setPragmaAndCache } from '../../middleware/set-pragma-cache.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(setPragmaAndCache).forRoutes('interaction');
  }
}

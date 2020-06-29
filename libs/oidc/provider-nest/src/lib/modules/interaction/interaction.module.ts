import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserService } from '../../services/user/user.service';
import { LayoutMiddleware } from '../../middleware/layout.middleware';
import { setPragmaAndCache } from '../../middleware/set-pragma-cache.middleware';

@Module({
    imports: [],
    controllers: [InteractionController],
    providers: [UserService],
    exports: [],
})
export class InteractionModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(setPragmaAndCache)
            .forRoutes('interaction');
    }
}

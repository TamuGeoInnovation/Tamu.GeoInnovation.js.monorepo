import { Module } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserService } from '../../services/user/user.service';

@Module({
    imports: [],
    controllers: [InteractionController],
    providers: [UserService],
    exports: [],
})
export class InteractionModule {}

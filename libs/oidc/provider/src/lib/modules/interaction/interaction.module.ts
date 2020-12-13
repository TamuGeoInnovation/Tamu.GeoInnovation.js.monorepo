import { Module } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    controllers: [InteractionController],
    providers: [],
    exports: [],
})
export class InteractionModule {}

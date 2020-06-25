import { Module } from '@nestjs/common';
import { InteractionController } from '../../controllers/interaction/interaction.controller';

@Module({
    imports: [],
    controllers: [InteractionController],
    providers: [],
    exports: [],
})
export class InteractionModule {}

import { Module } from '@nestjs/common';

import { UserModule } from '@tamu-gisc/oidc/common';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { OidcModule } from '../oidc/oidc.module';

@Module({
  imports: [OidcModule, UserModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}

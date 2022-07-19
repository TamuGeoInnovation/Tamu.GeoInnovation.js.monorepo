import { Module } from '@nestjs/common';
import { CommonNestServicesModule } from '@tamu-gisc/common/nest/services';

import { UserModule } from '@tamu-gisc/oidc/common';

import { InteractionController } from '../../controllers/interaction/interaction.controller';
import { OidcModule } from '../oidc/oidc.module';

@Module({
  imports: [OidcModule, UserModule, CommonNestServicesModule],
  controllers: [InteractionController],
  providers: [],
  exports: []
})
export class InteractionModule {}

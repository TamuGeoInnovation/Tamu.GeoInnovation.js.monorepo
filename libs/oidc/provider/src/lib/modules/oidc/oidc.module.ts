import { Module } from '@nestjs/common';

import { OidcProviderService } from '../../services/provider/provider.service';
import { OidcController } from '../../controllers/oidc/oidc.controller';

@Module({
  imports: [],
  controllers: [OidcController],
  providers: [OidcProviderService],
  exports: []
})
export class OidcModule {}

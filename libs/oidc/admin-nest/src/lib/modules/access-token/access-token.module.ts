import { Module, HttpModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessTokenRepo } from '@tamu-gisc/oidc/common';

import { AccessTokenController } from '../../controllers/access-token/access-token.controller';
import { AccessTokenService } from '../../services/access-token/access-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessTokenRepo]), HttpModule],
  providers: [AccessTokenService],
  controllers: [AccessTokenController],
  exports: [AccessTokenService]
})
export class AccessTokenModule {}

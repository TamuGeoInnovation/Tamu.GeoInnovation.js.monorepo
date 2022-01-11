import { Module } from '@nestjs/common';

import { AccessTokenController } from '../../controllers/access-token/access-token.controller';

@Module({
  imports: [],
  exports: [],
  controllers: [AccessTokenController],
  providers: []
})
export class AccessTokenModule {}

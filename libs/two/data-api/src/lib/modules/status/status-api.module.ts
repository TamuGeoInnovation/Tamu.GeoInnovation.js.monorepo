import { Module } from '@nestjs/common';

import { StatusAPIService } from './status-api.service';
import { StatusAPIController } from './status-api.controller';

@Module({
  providers: [StatusAPIService],
  controllers: [StatusAPIController],
  exports: [StatusAPIService]
})
export class StatusAPIModule {}

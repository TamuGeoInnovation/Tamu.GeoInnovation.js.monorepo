import { Module } from '@nestjs/common';
import { BaseService } from './base.service';
import { BaseController } from './base.controller';

@Module({
  providers: [BaseService],
  controllers: [BaseController]
})
export class BaseModule {}

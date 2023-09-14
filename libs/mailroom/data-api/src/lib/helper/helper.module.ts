import { Module } from '@nestjs/common';

import { HelperController } from './helper.controller';

@Module({
  controllers: [HelperController]
})
export class HelperModule {}

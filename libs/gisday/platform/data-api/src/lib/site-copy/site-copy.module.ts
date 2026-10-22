import { Module } from '@nestjs/common';

import { SiteCopyController } from './site-copy.controller';
import { SiteCopyService } from './site-copy.service';

@Module({
  controllers: [SiteCopyController],
  providers: [SiteCopyService]
})
export class SiteCopyModule {}

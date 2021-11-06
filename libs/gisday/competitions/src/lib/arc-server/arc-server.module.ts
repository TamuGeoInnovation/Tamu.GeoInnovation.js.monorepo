import { HttpModule, Module } from '@nestjs/common';

import { ArcServerService } from './arc-server.service';

@Module({
  imports: [HttpModule],
  providers: [ArcServerService],
  exports: [ArcServerService]
})
export class ArcServerModule {}

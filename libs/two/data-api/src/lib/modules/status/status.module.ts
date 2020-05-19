import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';

@Module({
  providers: [StatusService],
  controllers: [StatusController],
})
export class StatusModule {}

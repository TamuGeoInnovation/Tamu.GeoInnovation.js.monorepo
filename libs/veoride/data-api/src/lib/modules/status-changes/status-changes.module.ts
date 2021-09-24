import { Module } from '@nestjs/common';
import { StatusChangesService } from './status-changes.service';
import { StatusChangesController } from './status-changes.controller';

@Module({
  providers: [StatusChangesService],
  controllers: [StatusChangesController]
})
export class StatusChangesModule {}

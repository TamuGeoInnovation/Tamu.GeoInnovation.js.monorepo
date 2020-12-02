import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Snapshot } from '@tamu-gisc/cpa/common/entities';

import { SnapshotsService } from './snapshots.service';
import { SnapshotsController } from './snapshots.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  providers: [SnapshotsService],
  controllers: [SnapshotsController]
})
export class SnapshotsModule {}

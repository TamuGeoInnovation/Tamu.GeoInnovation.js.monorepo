import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SignageSubmission, StormwaterSubmission, SidewalkSubmission, ManholeSubmission } from '../entities/all.entity';
import { WaybackCompetitionController } from './wayback-competition.controller';
import { WaybackCompetitionProvider } from './wayback-competition.provider';

@Module({
  imports: [TypeOrmModule.forFeature([SignageSubmission, StormwaterSubmission, SidewalkSubmission, ManholeSubmission])],
  exports: [],
  controllers: [WaybackCompetitionController],
  providers: [WaybackCompetitionProvider]
})
export class WaybackCompetitionModule {}

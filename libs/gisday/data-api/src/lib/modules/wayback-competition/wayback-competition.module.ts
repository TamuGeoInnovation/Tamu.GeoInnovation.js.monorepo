import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  SignageSubmissionRepo,
  StormwaterSubmissionRepo,
  SidewalkSubmissionRepo,
  ManholeSubmissionRepo
} from '../../entities/all.entity';

import { WaybackCompetitionController } from '../../controllers/wayback-competition/wayback-competition.controller';
import { WaybackCompetitionProvider } from '../../providers/wayback-competition/wayback-competition.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SignageSubmissionRepo,
      StormwaterSubmissionRepo,
      SidewalkSubmissionRepo,
      ManholeSubmissionRepo
    ])
  ],
  exports: [],
  controllers: [WaybackCompetitionController],
  providers: [WaybackCompetitionProvider]
})
export class WaybackCompetitionModule {}

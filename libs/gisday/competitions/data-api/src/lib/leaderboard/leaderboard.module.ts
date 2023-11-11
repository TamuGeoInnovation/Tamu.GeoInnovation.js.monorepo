import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Season } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission, SubmissionLocation, SubmissionMedia } from '../entities/all.entities';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompetitionSubmission, SubmissionLocation, SubmissionMedia, Season, CompetitionSeason])
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService]
})
export class LeaderboardModule {}

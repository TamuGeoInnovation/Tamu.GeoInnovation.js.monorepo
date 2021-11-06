import { Module } from '@nestjs/common';

import { LeaderboardModule } from '../lib/leaderboard/leaderboard.module';
import { MapModule } from '../lib/map/map.module';
import { SubmissionModule } from '../lib/submission/submission.module';
@Module({
  imports: [LeaderboardModule, MapModule, SubmissionModule],
  controllers: [],
  providers: [],
  exports: [LeaderboardModule, MapModule, SubmissionModule]
})
export class GisdayCompetitionsModule {}

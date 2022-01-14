import { Module } from '@nestjs/common';

import { LeaderboardModule } from '../lib/leaderboard/leaderboard.module';
import { MapModule } from '../lib/map/map.module';
import { SubmissionModule } from '../lib/submission/submission.module';
import { SeasonModule } from '../lib/season/season.module';
import { FormModule } from '../lib/form/form.module';
@Module({
  imports: [LeaderboardModule, MapModule, SubmissionModule, SeasonModule, FormModule],
  controllers: [],
  providers: [],
  exports: [LeaderboardModule, MapModule, SubmissionModule, SeasonModule, FormModule]
})
export class GisdayCompetitionsDataApiModule {}

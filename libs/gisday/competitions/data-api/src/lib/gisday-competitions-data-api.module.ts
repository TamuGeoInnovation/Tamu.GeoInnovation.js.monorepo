import { Module } from '@nestjs/common';

import { LeaderboardModule } from '../lib/leaderboard/leaderboard.module';
import { MapModule } from '../lib/map/map.module';
import { SubmissionModule } from '../lib/submission/submission.module';
import { SeasonModule } from '../lib/season/season.module';
import { FormModule } from '../lib/form/form.module';
import { ExportModule } from '../lib/export/export.module';
import { VgiDashboardModule } from '../lib/dashboard/vgi-dashboard.module';
import { TrailWinnersModule } from '../lib/trail-winners/trail-winners.module';

@Module({
  imports: [
    LeaderboardModule,
    MapModule,
    SubmissionModule,
    SeasonModule,
    FormModule,
    ExportModule,
    VgiDashboardModule,
    // The trail challenge's winners on the Winners page (#3243).
    TrailWinnersModule
  ],
  controllers: [],
  exports: [LeaderboardModule, MapModule, SubmissionModule, SeasonModule, FormModule, ExportModule]
})
export class GisdayCompetitionsDataApiModule {}

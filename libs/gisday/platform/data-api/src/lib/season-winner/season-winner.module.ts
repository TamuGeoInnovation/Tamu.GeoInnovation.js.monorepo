import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardProfilesService } from '../dashboards/dashboard-profiles.service';
import { Organization, Season, SeasonWinner, Submission, University } from '../entities/all.entity';
import { SeasonWinnerController } from './season-winner.controller';
import { SeasonWinnerService } from './season-winner.service';

/**
 * A season's winners, picked by the admins and shown on the homepage (#3239). Exported for the trail challenge's picker
 * (#3243), whose submitters the competitions' leaderboard ranks.
 */
@Module({
  imports: [TypeOrmModule.forFeature([SeasonWinner, Season, Submission, University, Organization])],
  controllers: [SeasonWinnerController],
  providers: [SeasonWinnerService, DashboardProfilesService],
  exports: [SeasonWinnerService, DashboardProfilesService]
})
export class SeasonWinnerModule {}

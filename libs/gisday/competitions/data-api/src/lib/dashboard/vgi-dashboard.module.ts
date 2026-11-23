import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardProfilesService, Organization, University } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason } from '../entities/all.entities';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { VgiDashboardController } from './vgi-dashboard.controller';
import { VgiDashboardProvider } from './vgi-dashboard.provider';

/** The VGI submissions dashboard (#2894): the leaderboard's scoring, and accounts' profiles as the other dashboards read them. */
@Module({
  imports: [LeaderboardModule, TypeOrmModule.forFeature([CompetitionSeason, University, Organization])],
  controllers: [VgiDashboardController],
  providers: [VgiDashboardProvider, DashboardProfilesService]
})
export class VgiDashboardModule {}

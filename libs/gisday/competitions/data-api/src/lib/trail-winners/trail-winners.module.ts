import { Module } from '@nestjs/common';

import { SeasonWinnerModule } from '@tamu-gisc/gisday/platform/data-api';

import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { TrailWinnersController } from './trail-winners.controller';
import { TrailWinnersProvider } from './trail-winners.provider';

/** The trail challenge's winners on the Winners page (#3243): the leaderboard's ranking and the season's winners. */
@Module({
  imports: [LeaderboardModule, SeasonWinnerModule],
  controllers: [TrailWinnersController],
  providers: [TrailWinnersProvider]
})
export class TrailWinnersModule {}

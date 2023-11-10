import { Body, Controller, Get } from '@nestjs/common';

import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('competitions/leaderboards')
export class LeaderboardController {
  constructor(private service: LeaderboardService) {}

  @Get('/season')
  public getLeaderBoardForSeason(@Body() { season }) {
    return this.service.getLeaderBoardItemsForSeason(season);
  }

  @Get('/all')
  public get() {
    return this.service.getAllLeaderboardItems();
  }

  @Get()
  public getLeaderboard() {
    return this.service.getLeaderBoardForActiveSeason();
  }
}

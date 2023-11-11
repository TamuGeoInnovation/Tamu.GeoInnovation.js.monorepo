import { Controller, Get, NotImplementedException, Param } from '@nestjs/common';

import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('competitions/leaderboards')
export class LeaderboardController {
  constructor(private service: LeaderboardService) {}

  @Get('/season/:guid')
  public getLeaderBoardForSeason(@Param() { guid }) {
    return this.service.getLeaderBoardItemsForSeason(guid);
  }

  @Get('active')
  public getLeaderBoardForActiveSeason() {
    return this.service.getLeaderBoardItemsForActiveSeason();
  }

  @Get()
  public getLeaderboard() {
    throw new NotImplementedException();
  }
}

import { Controller, Get, NotImplementedException, Param, Req, UseGuards } from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/oidc/common';

import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('competitions/leaderboards')
export class LeaderboardController {
  constructor(private service: LeaderboardService) {}

  @UseGuards(JwtGuard)
  @Get('/season/:guid')
  public getLeaderBoardForSeason(@Req() req, @Param() { guid }) {
    return this.service.getLeaderBoardItemsForSeason(guid);
  }

  @UseGuards(JwtGuard)
  @Get('active')
  public getLeaderBoardForActiveSeason(@Req() req) {
    return this.service.getLeaderBoardItemsForActiveSeason();
  }

  @UseGuards(JwtGuard)
  @Get()
  public getLeaderboard() {
    throw new NotImplementedException();
  }
}


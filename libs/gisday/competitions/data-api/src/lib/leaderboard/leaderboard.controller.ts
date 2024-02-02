import { Controller, Get, NotImplementedException, Param, Req, UseGuards } from '@nestjs/common';

import { PermissionsGuard, Permissions, JwtGuard } from '@tamu-gisc/common/nest/auth';

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
  public getLeaderBoardForActiveSeason() {
    return this.service.getLeaderBoardItemsForActiveSeason();
  }

  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('active/admin')
  public getLeaderBoardForActiveSeasonWithIdentities() {
    return this.service.getLeaderBoardItemsForActiveSeason(true);
  }

  @UseGuards(JwtGuard)
  @Get()
  public getLeaderboard() {
    throw new NotImplementedException();
  }
}

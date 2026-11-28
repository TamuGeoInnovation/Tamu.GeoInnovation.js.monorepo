import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';

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
    // The same board as everyone's: participants are named by their masked email, admins included, so the board can be
    // shown to a room (#3168). Kept so the admin pages that ask for it keep working.
    return this.service.getLeaderBoardItemsForActiveSeason();
  }
}

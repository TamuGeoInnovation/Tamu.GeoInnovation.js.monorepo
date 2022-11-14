import { Body, Controller, Get } from '@nestjs/common';

import { CompetitionSubmission } from '../entities/all.entities';
import { BaseController } from '../_base/base.controller';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController extends BaseController<CompetitionSubmission> {
  constructor(private service: LeaderboardService) {
    super(service);
  }

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

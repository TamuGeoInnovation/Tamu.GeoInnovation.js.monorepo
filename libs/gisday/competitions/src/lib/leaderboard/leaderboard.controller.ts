import { Controller, Get } from '@nestjs/common';

import { CompetitionSubmission } from '@tamu-gisc/gisday/common';

import { BaseController } from '../_base/base.controller';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController extends BaseController<CompetitionSubmission> {
  constructor(private service: LeaderboardService) {
    super(service);
  }

  @Get()
  public getLeaderboard() {
    return this.service.getAllLeaderboardItems();
  }
}
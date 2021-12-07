import { Controller, Get, Param } from '@nestjs/common';

import { CompetitionSeason } from '../entities/all.entities';
import { BaseController } from '../_base/base.controller';
import { GetSeasonStatisticsDto, SeasonService } from './season.service';

@Controller('season')
export class SeasonController extends BaseController<CompetitionSeason> {
  constructor(private service: SeasonService) {
    super(service);
  }

  @Get(':season/statistics')
  public getStatisticsForSeason(@Param() params: GetSeasonStatisticsDto) {
    return this.service.getSeasonStatistics(params.season);
  }
}

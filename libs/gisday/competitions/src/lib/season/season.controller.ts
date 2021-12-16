import { Controller, Get, Param } from '@nestjs/common';

import { CompetitionSeason } from '../entities/all.entities';
import { GetSeasonStatisticsDto } from '../dtos/dtos';
import { BaseController } from '../_base/base.controller';
import { SeasonService } from './season.service';

@Controller('season')
export class SeasonController extends BaseController<CompetitionSeason> {
  constructor(private service: SeasonService) {
    super(service);
  }

  @Get(':guid/statistics')
  public getStatisticsForSeason(@Param() params: GetSeasonStatisticsDto) {
    return this.service.getSeasonStatistics(params.guid);
  }
}

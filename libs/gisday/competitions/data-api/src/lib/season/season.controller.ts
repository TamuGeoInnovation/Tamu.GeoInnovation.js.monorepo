import { Controller, Get, Param } from '@nestjs/common';

import { GetSeasonStatisticsDto } from '../dtos/dtos';
import { SeasonService } from './season.service';

@Controller('competitions/seasons')
export class SeasonController {
  constructor(private service: SeasonService) {}

  @Get(':guid/statistics')
  public getStatisticsForSeason(@Param() params: GetSeasonStatisticsDto) {
    return this.service.getSeasonStatistics(params.guid);
  }
}

import { Body, Controller, Get, Param, Put } from '@nestjs/common';

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

  @Put('/disable/all')
  public disableAllSeasons() {
    return this.service.disableAllSeasons();
  }

  @Put('/enable')
  public setActiveSeason(@Body() { guid }) {
    return this.service.setActiveSeason(guid);
  }
}

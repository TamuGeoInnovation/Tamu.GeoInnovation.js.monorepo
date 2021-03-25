import { Controller, Get } from '@nestjs/common';

import { WaybackCompetitionProvider } from '../../providers/wayback-competition/wayback-competition.provider';

@Controller('wayback-competition')
export class WaybackCompetitionController {
  constructor(private readonly waybackProvider: WaybackCompetitionProvider) {}

  @Get('signage')
  public async getSignage() {
    return this.waybackProvider.getSignageSubmissions();
  }

  @Get('stormwater')
  public async getStormwater() {
    return this.waybackProvider.getStormwaterSubmissions();
  }

  @Get('sidewalks')
  public async getSidewalks() {
    return this.waybackProvider.getSidewalkSubmissions();
  }

  @Get('manholes')
  public async getManholes() {
    return this.waybackProvider.getManholeSubmissions();
  }
}

import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { Website } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { WebsitesService } from './websites.service';

@Controller('websites')
export class WebsitesController extends BaseController<Website> {
  constructor(private service: WebsitesService) {
    super(service);
  }

  @Get('county/:fips')
  public async getPhoneNumbersForCounties(@Param() params) {
    return this.service.getWebsitesForCounty(params.fips);
  }

  @Post('county')
  public async setWebsitesForCounty(@Body() body) {
    return this.service.setWebsitesForCounty(body.websites, body.countyFips);
  }
}

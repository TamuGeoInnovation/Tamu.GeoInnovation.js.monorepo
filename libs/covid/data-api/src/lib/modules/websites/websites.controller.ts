import { Controller, Get, Param, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CategoryValue } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { WebsitesService } from './websites.service';

@Controller('websites')
export class WebsitesController extends BaseController<CategoryValue> {
  constructor(private service: WebsitesService) {
    super(service);
  }

  @Get('county/:fips')
  public async getWebsitesForCounty(@Param() params) {
    return this.service.getWebsitesForCounty(params.fips);
  }

  @Get('claim/info/:guid')
  public async getWebsitesForClaimInfo(@Param() params) {
    return this.service.getWebsitesForClaimInfo(params.guid);
  }

  @Post('')
  public async storePhoneNumber(@Body() body) {
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        message: 'Not implemented',
        success: false
      },
      HttpStatus.NOT_IMPLEMENTED
    );
  }
}

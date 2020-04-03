import { Controller, Delete, Patch, Param, Post, Body, Get } from '@nestjs/common';

import { County } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { CountiesService } from './counties.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

@Controller('counties')
export class CountiesController extends BaseController<County> {
  constructor(private service: CountiesService, private claimService: CountyClaimsService) {
    super(service);
  }

  @Get('state/:fips/:keyword')
  public searchCountiesForState(@Param() params) {
    return this.service.searchCountiesForState(params.fips, params.keyword);
  }

  @Get('state/:fips')
  public getCountiesForState(@Param() params) {
    return this.service.getCountiesForState(params.fips);
  }

  @Get(':keyword')
  public searchState(@Param() params) {
    return this.service.search(params.keyword);
  }

  @Get('claim/:email')
  public getCountyClaimsForUser(@Param() param) {
    return this.claimService.getClaimsForUser(param.email);
  }

  @Post('claim')
  public registerCountyToUser(@Body() body) {
    return this.claimService.associateUserWithCounty(body.countyFips, body.email);
  }

  @Post('')
  public insertState() {
    return 'Not implemented.';
  }

  @Patch(':id')
  public updateState() {
    return 'Not implemented.';
  }

  @Delete(':id')
  public deleteState() {
    return 'Not implemented.';
  }
}

import { Controller, Post, Get, Patch, Delete, Param } from '@nestjs/common';

import { CountyClaim } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { CountyClaimsService } from './county-claims.service';

@Controller('county-claims')
export class CountyClaimsController extends BaseController<CountyClaim> {
  constructor(private service: CountyClaimsService) {
    super(service);
  }

  @Get('active/:countyFips')
  public getActiveClaimsForCountyFips(@Param() params) {
    return this.service.getActiveClaimsForCountyFips(params.countyFips);
  }

  @Get('active')
  public getActiveClaims() {
    return this.service.getActiveClaims();
  }

  @Post('')
  public postOverride() {
    return 'Not Implemented';
  }

  @Patch(':id')
  public patchOverride() {
    return 'Not Implemented';
  }

  @Delete('')
  public deleteOverride() {
    return 'Not Implemented';
  }
}

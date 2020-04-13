import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';

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

  @Get('claim/active/:email')
  public getActiveClaimsForUser(@Param() param) {
    return this.service.getActiveClaimsForEmail(param.email);
  }

  @Post('claim')
  public registerClaim(@Body() body) {
    return this.service.createOrUpdateClaim(body, body.phoneNumbers, body.websites);
  }

  @Post('close')
  public closeClaim(@Body() body) {
    return this.service.closeClaim(body.guid);
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

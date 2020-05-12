import { Controller, Post, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';

import { CountyClaim } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { CountyClaimsService } from './county-claims.service';

import { AdminRoleGuard } from '@tamu-gisc/oidc';

@Controller('county-claims')
export class CountyClaimsController extends BaseController<CountyClaim> {
  constructor(private service: CountyClaimsService) {
    super(service);
  }

  @Get('active/:countyFips')
  public async getActiveClaimsForCountyFips(@Param() params) {
    try {
      const claims = await this.service.getActiveClaimsForCountyFips(params.countyFips);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('claim/:email')
  public async getAllUserCountyClaimsSortedByCounty(@Param() param) {
    try {
      const claims = await this.service.getAllUserCountyClaimsSortedByCounty(param.email);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('claim/active/:email')
  public async getActiveClaimsForUser(@Param() param) {
    try {
      const claims = await this.service.getActiveClaimsForEmail(param.email);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('county/:countyFips/:limit')
  public async getPreviousClaimsForCounty(@Param() params) {
    try {
      const claims = await this.service.getHistoricClaimsForCounty(params.countyFips, params.limit);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('suggested/:stateFips/:count')
  public async getSuggestedCountyClaims(@Param() params) {
    try {
      const claims = await this.service.getSuggestedClaims(params.stateFips, params.count);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @UseGuards(AdminRoleGuard)
  @Post('admin/claim')
  public async getClaimsAdmin(@Body() body) {
    try {
      const claims = await this.service.getClaimsAdmin(body);
      return claims;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
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

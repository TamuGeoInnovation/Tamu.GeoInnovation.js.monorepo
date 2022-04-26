import { Controller, Delete, Post, Get, Param, Body, UseGuards, NotImplementedException } from '@nestjs/common';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { BaseController } from '../base/base.controller';

@Controller('sites')
export class TestingSitesController extends BaseController<TestingSite> {
  constructor(private service: TestingSitesService, private ccs: CountyClaimsService) {
    super(service);
  }

  @Get('')
  public async getValidated() {
    return await this.service.repo.find({
      where: { validated: true }
    });
  }

  @Get('details/:siteGuid')
  public async getDetailsForSite(@Param() params) {
    return this.service.getSiteAndLatestInfo(params.siteGuid);
  }

  @Get(':siteGuid/infos')
  public async getInfosForSite(@Param() params) {
    return this.service.getInfosForSite(params.siteGuid);
  }

  @Get('county')
  public async getTestingSitesSortedByCounty() {
    return await this.service.getTestingSitesSortedByCounty();
  }

  @Get('county/:countyFips')
  public async getSitesByCounty(@Param() params) {
    return await this.service.getSitesForCounty(params.countyFips);
  }

  @Get('user/:userIdentifier')
  public async getSitesForUser(@Param() params) {
    return await this.service.getSitesForUser(params.userIdentifier);
  }

  @UseGuards(AdminRoleGuard)
  @Post('admin')
  public async getTestingSitesAdmin(@Body() body) {
    try {
      const sites = await this.service.getTestingSitesAdmin(body.stateFips, body.countyFips, body.email);
      return sites;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Post('')
  public async addTestingSite(@Body() body) {
    return this.service.createOrUpdateTestingSite(body);
  }

  @Post('/siteless')
  public async registerCountyAsSiteless(@Body() body) {
    return this.service.registerCountyAsSiteless(body.countyFips);
  }

  @Post('/validate/:siteId')
  public async validateLockdown() {
    return new NotImplementedException();
  }

  @Delete('/validate/:siteId')
  public async deleteValidatedLockdown() {
    return new NotImplementedException();
  }
}

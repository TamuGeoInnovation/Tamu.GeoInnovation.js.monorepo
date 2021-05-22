import { Controller, Delete, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { TestingSitesService } from './testing-sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

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
  public async validateLockdown(@Param() params) {
    // const site = await this.service.repo.findOne({ guid: params.siteId });
    // if (site) {
    //   site.validated = true;
    //   return site.save();
    // } else {
    //   return {
    //     status: 500,
    //     success: false,
    //     message: 'Site ID not found.'
    //   };
    // }
  }

  @Delete('/validate/:siteId')
  public async deleteValidatedLockdown(@Param() params) {
    // const site = await this.service.repo.findOne({ guid: params.siteId });
    // site.validated = false;
    // return site.save();
  }
}

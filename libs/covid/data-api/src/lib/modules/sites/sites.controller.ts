import { Controller, Delete, Post, Get, Param, Body } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { SitesService } from './sites.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

@Controller('sites')
export class SitesController extends BaseController<TestingSite> {
  constructor(private service: SitesService, private ccs: CountyClaimsService) {
    super(service);
  }

  @Get('')
  public async getValidated() {
    return await this.service.repo.find({
      where: { validated: true },
      // relations: ['source', 'source.user', 'restrictions']
    });
  }

  @Get(':siteGuid/infos')
  public async getInfosForSite(@Param() params) {
      return this.service.getInfosForSite(params.siteGuid);
  }

  // @Get(':countyFips')
  // public async getSitesForCounty(@Param() params) {
  //   return await this.service.getSitesForCounty(params.countyFips);
  // }

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

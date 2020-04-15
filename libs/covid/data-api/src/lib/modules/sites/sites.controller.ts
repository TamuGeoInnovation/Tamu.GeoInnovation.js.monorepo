import { Controller, Delete, Post, Get, Param, Body } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { SitesService } from './sites.service';
import { DeepPartial } from 'typeorm';
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
      relations: ['source', 'source.user', 'restrictions']
    });
  }

  @Get(':state/:county')
  public async getSitesForCounty(@Param() params) {
    return await this.service.getSitesForCounty(params.state, params.county);
  }

  @Post('')
  public async addTestingSite(@Body() body) {
    return this.service.createOrUpdateTestingSite(body);
  }

  // TODO: Fix adding testing sites
  /**
   Insert an un-validated testing site.
   */
  // @Post('')
  // public async insertSite(@Body() body) {
  //   //
  //   // Resolve user by existing or new email
  //   //
  //   const userFindOptions = {
  //     email: body.claim.user.email
  //   };

  //   const user = await this.service.userRepo.findOne(userFindOptions);

  //   const claims = await this.ccs.getActiveClaimsForEmail(body.claim.user.email);

  //   const claim = claims.find((c) => c.county.countyFips === body.claim.county.countyFips);

  //   if (!claim) {
  //     return {
  //       status: 400,
  //       success: false,
  //       message: 'Lockdown and claim mismatch.'
  //     };
  //   }

  //   if (claim.processing === false || claim.closed === true) {
  //     return {
  //       status: 400,
  //       success: false,
  //       message: 'Claim for county is inactive. Re-open it to modify details.'
  //     };
  //   }

  //   // If no user was found with the given email, make a new one
  //   if (!user) {
  //     return {
  //       status: 400,
  //       success: false,
  //       message: 'Invalid email.'
  //     };
  //   }

  //   //
  //   // Resolve restrictions
  //   //
  //   let restrictions;

  //   if (body.info.restrictions && body.info.restrictions !== null) {
  //     const restrictionList = body.info.restrictions.split(',').map((id) => {
  //       return {
  //         guid: id
  //       };
  //     });

  //     restrictions = await this.service.restrictionRepo.find({
  //       where: restrictionList
  //     });
  //   }

  //   //
  //   // Resolve owner types
  //   //

  //   let owners;

  //   if (body.info.owners && body.info.owners !== null) {
  //     const ownersTypeList = body.info.owners.split(',').map((id) => {
  //       return {
  //         guid: id
  //       };
  //     });

  //     owners = await this.service.ownerRepo.find({
  //       where: ownersTypeList
  //     });
  //   }

  //   //
  //   // Resolve site service types
  //   //

  //   let services;

  //   if (body.info.services && body.info.services !== null) {
  //     const serviceList = body.info.services.split(',').map((id) => {
  //       return {
  //         guid: id
  //       };
  //     });

  //     services = await this.service.serviceRepo.find({
  //       where: serviceList
  //     });
  //   }

  //   //
  //   // Resolve site status
  //   //
  //   const status = await this.service.statusRepo.find({ guid: body.info.status });

  //   //
  //   // Create site
  //   //

  //   const p = { ...body, restrictions, owners, services, status };
  //   p.claim = claim;
  //   p.info.restrictions = restrictions;
  //   p.info.owners = owners;
  //   p.info.services = services;
  //   p.info.status = status;

  //   const site = this.service.repo.create(p as DeepPartial<TestingSite>);

  //   const result = await site.save();

  //   return result;
  // }

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

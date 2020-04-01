import { Controller, Delete, Post, Get, Param, Body } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { SitesService } from './sites.service';
import { DeepPartial } from 'typeorm';

@Controller('sites')
export class SitesController extends BaseController<TestingSite> {
  constructor(private service: SitesService) {
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

  /**
   Insert an un-validated testing site.
   */
  @Post('')
  public async insertSite(@Body() body) {
    //
    // Resolve user by existing or new email
    //
    const userFindOptions = {
      email: body.email
    };

    let user = await this.service.userRepo.findOne(userFindOptions);

    // If no user was found with the given email, make a new one
    if (user === undefined) {
      user = this.service.userRepo.create(userFindOptions);

      await user.save();
    }

    //
    // Resolve submission classification
    //
    const classification = await this.service.classificationRepo.findOne({ guid: body.classification });

    const source = this.service.sourceRepo.create({
      url: body.url,
      user: user,
      classification: classification,
      healthDepartmentUrl: body.healthDepartmentUrl
    });

    //
    // Resolve restrictions
    //
    let restrictions;

    if (body.restrictions && body.restrictions !== null) {
      const restrictionList = body.restrictions.split(',').map((id) => {
        return {
          guid: id
        };
      });

      restrictions = await this.service.restrictionRepo.find({
        where: restrictionList
      });
    }

    //
    // Resolve owner types
    //

    let owners;

    if (body.owners && body.owners !== null) {
      const ownersTypeList = body.owners.split(',').map((id) => {
        return {
          guid: id
        };
      });

      owners = await this.service.ownerRepo.find({
        where: ownersTypeList
      });
    }

    //
    // Resolve site service types
    //

    let services;

    if (body.owners && body.owners !== null) {
      const serviceList = body.services.split(',').map((id) => {
        return {
          guid: id
        };
      });

      services = await this.service.serviceRepo.find({
        where: serviceList
      });
    }

    //
    // Resolve site status
    //
    const status = await this.service.statusRepo.findOne({ guid: body.status });

    //
    // Create site
    //
    const site = this.service.repo.create({ ...body, source, user, restrictions, owners, services, status } as DeepPartial<
      TestingSite
    >);

    return await site.save();
  }

  @Post('/validate/:siteId')
  public async validateLockdown(@Param() params) {
    const site = await this.service.repo.findOne({ guid: params.siteId });

    if (site) {
      site.validated = true;

      return site.save();
    } else {
      return {
        status: 500,
        success: false,
        message: 'Site ID not found.'
      };
    }
  }

  @Delete('/validate/:siteId')
  public async deleteValidatedLockdown(@Param() params) {
    const site = await this.service.repo.findOne({ guid: params.siteId });

    site.validated = false;

    return site.save();
  }
}

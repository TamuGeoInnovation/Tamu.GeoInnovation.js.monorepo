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
    return await this.service.validatedRepo.find({ relations: ['testing_site', 'testing_site.source', 'testing_site.source.user'] });
  }

  /**
   Insert an un-validated testing site.
   */
  @Post('')
  public async insertSite(@Body() body) {
    const userFindOptions = {
      email: body.email
    };

    let user = await this.service.userRepo.findOne(userFindOptions);

    // If no user was found with the given email, make a new one
    if (user === undefined) {
      user = this.service.userRepo.create(userFindOptions);
    }

    const source = this.service.sourceRepo.create({
      url: body.url,
      user: user
    });

    const site = this.service.repo.create({ ...body, source, user } as DeepPartial<TestingSite>);

    return await site.save();
  }

  @Post('/validate/:siteId')
  public async validateLockdown(@Param() params) {
    const site = await this.service.repo.findOne({ guid: params.siteId });

    if (site) {
      const validated = this.service.validatedRepo.create({ testing_site: site });

      return validated.save();
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
    const validated = await this.service.validatedRepo.findOne({ guid: params.siteId });

    return validated.remove();
  }
}

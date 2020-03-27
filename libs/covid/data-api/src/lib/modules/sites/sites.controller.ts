import { Controller, Delete, Post, Get, Param } from '@nestjs/common';
import { BaseController } from '../base/base.controller';

import { TestingSite } from '@tamu-gisc/covid/common/entities';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController extends BaseController<TestingSite> {
  constructor(private service: SitesService) {
    super(service);
  }

  @Get('')
  public async getValidated() {
    return await this.service.validatedRepo.find({ relations: ['testing_site'] });
  }

  @Post('/validate/:siteId')
  public async validateLockdown(@Param() params) {
    const lockdown = await this.service.repo.findOne({ guid: params.siteId });

    const validated = this.service.validatedRepo.create({ testing_site: lockdown });

    return validated.save();
  }

  @Delete('/validate/:siteId')
  public async deleteValidatedLockdown(@Param() params) {
    const validated = await this.service.validatedRepo.findOne({ guid: params.siteId });

    return validated.remove();
  }
}

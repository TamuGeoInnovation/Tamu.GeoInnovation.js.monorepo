import { Controller, Post, Param, Delete, Get, Body } from '@nestjs/common';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { BaseController } from '../base/base.controller';

@Controller('lockdowns')
export class LockdownsController extends BaseController<Lockdown> {
  constructor(private service: LockdownsService) {
    super(service);
  }

  @Get('active/email/:email')
  public async getActiveLockdownsForEmail(@Param() param) {
    return this.service.getActiveLockDownForEmail(param.email);
  }

  @Get('active/county/:countyFips')
  public async getLockdownForCounty(@Param() params) {
    try {
      const countyLockdown = await this.service.getLockdownForCounty(params.countyFips);

      return countyLockdown;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('')
  public async getValidated() {
    return {
      status: 501,
      success: false,
      message: 'Not implemented.'
    };
  }

  /**
   Insert an un-validated testing site.
   */
  @Post('')
  public async addLockdown(@Body() body) {
    return this.service.createOrUpdateLockdown(body);
  }

  @Post('/validate/:lockdownId')
  public async validateLockdown(@Param() params) {
    // const lockdown = await this.service.repo.findOne({ guid: params.lockdownId });
    // lockdown.validated = true;
    // return lockdown.save();
    return {
      status: 501,
      success: false,
      message: 'Not implemented.'
    };
  }

  @Delete('/validate/:lockdownId')
  public async deleteValidatedLockdown(@Param() params) {
    // const lockdown = await this.service.repo.findOne({ guid: params.lockdownId });
    // lockdown.validated = false;
    // return lockdown.save();
    return {
      status: 501,
      success: false,
      message: 'Not implemented.'
    };
  }
}

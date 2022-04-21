import {
  Controller,
  Post,
  Param,
  Delete,
  Get,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  NotImplementedException
} from '@nestjs/common';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { BaseController } from '../base/base.controller';
import { AdminRoleGuard } from '@tamu-gisc/oidc/client';

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

  @Get('user/:email')
  public async getLockdownsForUser(@Param() params) {
    try {
      const lockdowns = await this.service.getAllLockdownsForUser(params.email);

      return lockdowns;
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

  @UseGuards(AdminRoleGuard)
  @Post('admin')
  public async getLockdownsAdmin(@Body() body) {
    try {
      const lockdowns = await this.service.getLockdownsAdmin(body.stateFips, body.countyFips, body.email);
      return lockdowns;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @UseGuards(AdminRoleGuard)
  @Get('admin/lockdown/:lockdownGuid')
  public async getClaimDetails(@Param() params) {
    try {
      const details = await this.service.getInfosForLockdown(params.lockdownGuid);
      return details;
    } catch (err) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('info/:infoGuid')
  public async getLockDownInfo(@Param() params) {
    try {
      const info = await this.service.getLockdownInfoForLockdown(params.infoGuid);

      return info;
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   Insert an un-validated testing site.
   */
  @Post('')
  public async addLockdown(@Body() body) {
    return this.service.createOrUpdateLockdown(body);
  }

  @Post('/validate/:lockdownId')
  public async validateLockdown() {
    return new NotImplementedException();
  }

  @Delete('/validate/:lockdownId')
  public async deleteValidatedLockdown() {
    return new NotImplementedException();
  }
}

import { Controller, Post, Param, Delete, Get, Body } from '@nestjs/common';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { BaseController } from '../base/base.controller';
import { DeepPartial } from 'typeorm';

@Controller('lockdowns')
export class LockdownsController extends BaseController<Lockdown> {
  constructor(private service: LockdownsService) {
    super(service);
  }

  @Get('')
  public async getValidated() {
    return await this.service.repo.find({ where: { validated: true } });
  }

  /**
   Insert an un-validated testing site.
   */
  @Post('')
  public async addLockdown(@Body() body) {
    return this.service.registerLockdown(body);
  }

  @Post('/validate/:lockdownId')
  public async validateLockdown(@Param() params) {
    const lockdown = await this.service.repo.findOne({ guid: params.lockdownId });

    lockdown.validated = true;

    return lockdown.save();
  }

  @Delete('/validate/:lockdownId')
  public async deleteValidatedLockdown(@Param() params) {
    const lockdown = await this.service.repo.findOne({ guid: params.lockdownId });

    lockdown.validated = false;

    return lockdown.save();
  }
}

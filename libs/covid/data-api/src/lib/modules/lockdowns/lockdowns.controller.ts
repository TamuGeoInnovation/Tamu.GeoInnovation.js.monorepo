import { Controller, Post, Param, Delete, Get } from '@nestjs/common';

import { Lockdown } from '@tamu-gisc/covid/common/entities';

import { LockdownsService } from './lockdowns.service';
import { BaseController } from '../base/base.controller';

@Controller('lockdowns')
export class LockdownsController extends BaseController<Lockdown> {
  constructor(private service: LockdownsService) {
    super(service);
  }

  @Get('')
  public async getValidated() {
    return await this.service.validatedRepo.find({ relations: ['lockdown'] });
  }

  @Post('/validate/:lockdownId')
  public async validateLockdown(@Param() params) {
    const lockdown = await this.service.repo.findOne({ guid: params.lockdownId });

    const validated = this.service.validatedRepo.create({ lockdown: lockdown });

    return validated.save();
  }

  @Delete('/validate/:lockdownId')
  public async deleteValidatedLockdown(@Param() params) {
    const validated = await this.service.validatedRepo.findOne({ guid: params.lockdownId });

    return validated.remove();
  }
}

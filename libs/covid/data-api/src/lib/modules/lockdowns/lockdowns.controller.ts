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
    return await this.service.validatedRepo.find({ relations: ['lockdown'] });
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
    // Create lockdown
    //
    const site = this.service.repo.create({ ...body, source, user } as DeepPartial<Lockdown>);

    return await site.save();
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

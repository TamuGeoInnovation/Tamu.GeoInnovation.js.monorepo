import { Controller, Get, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import { FieldCategory } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { PhoneNumbersService } from './phone-numbers.service';

@Controller('phone-numbers')
export class PhoneNumbersController extends BaseController<FieldCategory> {
  constructor(private service: PhoneNumbersService) {
    super(service);
  }

  @Get('')
  public async getAllNumbers() {
    return this.service.repo.find({ relations: ['type'] });
  }

  @Get('county/:fips')
  public async getPhoneNumbersForCounties(@Param() params) {
    return this.service.getPhoneNumbersForCounty(params.fips);
  }

  @Get('claim/info/:guid')
  public async getPhoneNumbersForClaimInfo(@Param() params) {
    return this.service.getPhoneNumbersForClaimInfo(params.guid);
  }

  @Post('')
  public async storePhoneNumber() {
    throw new HttpException('Not implemented.', HttpStatus.NOT_IMPLEMENTED);
  }
}

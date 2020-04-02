import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PhoneNumber } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { PhoneNumbersService } from './phone-numbers.service';

@Controller('phone-numbers')
export class PhoneNumbersController extends BaseController<PhoneNumber> {
  constructor(private service: PhoneNumbersService) {
    super(service);
  }

  @Get('')
  public async getAllNumbers() {
    return this.service.repo.find({ relations: ['type'] });
  }

  @Get('county/:fips')
  public async getPhoneNumbersForCounties(@Param() params) {
    return this.service.getPhoneNumbersForCounties(params.fips);
  }

  @Post('county')
  public async setPhoneNumbersForCounty(@Body() body) {
    return this.service.setPhoneNumbersForCounty(body.numbers, body.countyFips);
  }

  @Post('')
  public async storePhoneNumber(@Body() body) {
    return this.service.insertPhoneNumber(body.number, body.type);
  }
}

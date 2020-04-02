import { Controller, Get, Post, Body } from '@nestjs/common';
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

  @Post('')
  public async storePhoneNumber(@Body() body) {
    return this.service.insertPhoneNumber(body.number, body.type);
  }
}

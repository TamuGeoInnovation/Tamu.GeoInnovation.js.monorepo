import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PhoneNumber, PhoneNumberType } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class PhoneNumbersService extends BaseService<PhoneNumber> {
  constructor(
    @InjectRepository(PhoneNumber) public repo: Repository<PhoneNumber>,
    @InjectRepository(PhoneNumberType) public phoneTypeRepo: Repository<PhoneNumberType>
  ) {
    super(repo);
  }

  public async insertPhoneNumber(number: string, typeGuid?: string) {
    // Identify phone number type if one is provided
    const phoneType = await this.phoneTypeRepo.findOne({ guid: typeGuid });

    return this.repo.create({ number: number, type: phoneType }).save();
  }
}

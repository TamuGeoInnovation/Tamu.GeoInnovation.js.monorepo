import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PhoneNumber, PhoneNumberType, County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class PhoneNumbersService extends BaseService<PhoneNumber> {
  constructor(
    @InjectRepository(PhoneNumber) public repo: Repository<PhoneNumber>,
    @InjectRepository(PhoneNumberType) public phoneTypeRepo: Repository<PhoneNumberType>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(CountyClaim) public claimRepo: Repository<CountyClaim>
  ) {
    super(repo);
  }

  public async insertPhoneNumber(number: string, typeGuid?: string) {
    // Identify phone number type if one is provided
    const phoneType = await this.phoneTypeRepo.findOne({ guid: typeGuid });

    return this.repo.create({ number: number, type: phoneType }).save();
  }

  public async getPhoneNumbersForCounty(countyFips) {
    if (countyFips === undefined || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    const claim = await this.claimRepo.findOne({
      where: {
        county: countyFips
      },
      relations: ['info', 'info.phoneNumbers', 'info.phoneNumbers.type'],
      order: {
        created: 'DESC'
      }
    });

    return claim && claim.info && claim.info.phoneNumbers ? claim.info.phoneNumbers : [];
  }
}

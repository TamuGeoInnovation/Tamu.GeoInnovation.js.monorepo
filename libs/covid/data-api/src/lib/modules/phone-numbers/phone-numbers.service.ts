import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FieldCategory, CategoryValue, County, CountyClaim, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

@Injectable()
export class PhoneNumbersService extends BaseService<FieldCategory> {
  constructor(
    @InjectRepository(FieldCategory) public repo: Repository<FieldCategory>,
    @InjectRepository(CategoryValue) public valueRepo: Repository<CategoryValue>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(CountyClaim) public claimRepo: Repository<CountyClaim>,
    @InjectRepository(CountyClaimInfo) public claimInfoRepo: Repository<CountyClaimInfo>
  ) {
    super(repo);
  }

  public async insertPhoneNumber(number: string, typeGuid?: string) {
    // Identify phone number type if one is provided
    const phoneType = await this.valueRepo.findOne({ guid: typeGuid });

    // TODO: Fix
    // return this.repo.create({ number: number, type: phoneType }).save();
  }

  public async getPhoneNumbersForCounty(countyFips) {
    if (countyFips === undefined || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    const claim = await this.claimInfoRepo
      .createQueryBuilder('info')
      .innerJoinAndSelect('info.claim', 'claim')
      .innerJoinAndSelect('info.responses', 'responses')
      .innerJoinAndSelect('responses.entityValue', 'entityToValue')
      .innerJoinAndSelect('entityToValue.value', 'value')
      .innerJoinAndSelect('value.category', 'category')
      .where('claim.countyFips = :countyFips AND category.id = :type', {
        countyFips: countyFips,
        type: CATEGORY.PHONE_NUMBERS
      })
      .orderBy('claim.created', 'DESC')
      .getOne();

    // TODO: Return formatted phone number list, to match the front-end
    return claim;
  }
}

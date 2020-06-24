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

  public async getPhoneNumbersForCounty(countyFips) {
    if (countyFips === undefined || countyFips === 'undefined' || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    return this.getPhoneNumbers({ countyFips });
  }

  public async getPhoneNumbersForClaimInfo(infoGuid: string) {
    if (infoGuid === undefined) {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    return this.getPhoneNumbers({ infoGuid });
  }

  private async getPhoneNumbers(args?: { countyFips?: number | string; infoGuid?: string }) {
    // Validate the claim first
    const query = await this.claimInfoRepo
      .createQueryBuilder('info')
      .leftJoinAndSelect('info.claim', 'claim')
      .leftJoinAndSelect('info.responses', 'responses')
      .leftJoinAndSelect('responses.entityValue', 'entityValue')
      .leftJoinAndSelect('entityValue.value', 'value')
      .leftJoinAndSelect('value.type', 'type')
      .leftJoinAndSelect('value.category', 'category');

    if (args && args.countyFips) {
      query.where('claim.countyFips = :countyFips', {
        countyFips: args.countyFips
      });
    } else if (args && args.infoGuid) {
      query.where('info.guid = :infoGuid', {
        infoGuid: args.infoGuid
      });
    }

    query.orderBy('info.created', 'DESC');

    const info = await query.getOne();

    if (info && info.responses && info.responses.length > 0) {
      // Since I'm a dummy and don't know how to do to return only the responses with category id for
      // phone numbers, doing the filtering after the data comes back.
      //
      // Also mapping into a collection of entity values. Consumers of the callee do not care for anything
      // other than the list of responses.
      const mappedResponses = info.responses.reduce((acc, curr) => {
        if (curr.entityValue.value.category.id !== CATEGORY.PHONE_NUMBERS) {
          return acc;
        }

        return [...acc, curr.entityValue];
      }, []);

      return mappedResponses;
    } else {
      return [];
    }
  }
}

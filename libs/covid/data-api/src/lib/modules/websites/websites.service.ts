import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { County, CountyClaim, CategoryValue, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CATEGORY } from '@tamu-gisc/covid/common/enums';

@Injectable()
export class WebsitesService extends BaseService<CategoryValue> {
  constructor(
    @InjectRepository(CategoryValue) public repo: Repository<CategoryValue>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(CountyClaim) public claimRepo: Repository<CountyClaim>,
    @InjectRepository(CountyClaimInfo) public claimInfoRepo: Repository<CountyClaimInfo>
  ) {
    super(repo);
  }

  public async getWebsitesForCounty(countyFips: number) {
    if (countyFips === undefined || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    // Validate the claim first
    const lastInfo = await this.claimInfoRepo
      .createQueryBuilder('info')
      .leftJoinAndSelect('info.claim', 'claim')
      .leftJoinAndSelect('info.responses', 'responses')
      .leftJoinAndSelect('responses.entityValue', 'entityValue')
      .leftJoinAndSelect('entityValue.value', 'value')
      .leftJoinAndSelect('value.type', 'type')
      .leftJoinAndSelect('value.category', 'category')
      .where('claim.countyFips = :countyFips', {
        countyFips: countyFips
      })
      .orderBy('info.created', 'DESC')
      .getOne();

    if (lastInfo && lastInfo.responses && lastInfo.responses.length > 0) {
      // Since I'm a dummy and don't know how to do to return only the responses with category id for
      // phone numbers, doing the filtering after the data comes back.
      //
      // Also mapping into a collection of entity values. Consumers of the callee do not care for anything
      // other than the list of responses.
      const mappedResponses = lastInfo.responses.reduce((acc, curr) => {
        if (curr.entityValue.value.category.id !== CATEGORY.WEBSITES) {
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

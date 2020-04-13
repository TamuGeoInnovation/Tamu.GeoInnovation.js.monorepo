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

    const claim = await this.claimInfoRepo
      .createQueryBuilder('info')
      .innerJoinAndSelect('info.claim', 'claim')
      .innerJoinAndSelect('info.responses', 'responses')
      .innerJoinAndSelect('responses.entityValue', 'entityToValue')
      .innerJoinAndSelect('entityToValue.value', 'value')
      .innerJoinAndSelect('value.type', 'type')
      .innerJoinAndSelect('value.category', 'category')
      .where('claim.countyFips = :countyFips AND category.id = :type', {
        countyFips: countyFips,
        type: CATEGORY.WEBSITES
      })
      .orderBy('claim.created', 'DESC')
      .getOne();

    const mappedWebsites = claim.responses.map((response) => {
      return response.entityValue;
    });

    return mappedWebsites;
  }
}

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CATEGORY } from '@tamu-gisc/covid/common/enums';
import { County, CountyClaim, CategoryValue, CountyClaimInfo } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

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

  public async getWebsitesForCounty(countyFips: number | string) {
    if (countyFips === undefined || countyFips === 'undefined' || typeof countyFips !== 'string') {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips'
      };
    }

    return this.getWebsites({ countyFips });
  }

  public async getWebsitesForClaimInfo(claimInfoGuid: string) {
    if (claimInfoGuid === undefined) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: 'Invalid claim info guid',
          success: false
        },
        HttpStatus.UNPROCESSABLE_ENTITY
      );
    }

    return this.getWebsites({ claimInfoGuid });
  }

  private async getWebsites(args: { countyFips?: number | string; claimInfoGuid?: string }) {
    // Validate the claim first
    const query = this.claimInfoRepo
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
    } else if (args && args.claimInfoGuid) {
      query.where('info.guid = :infoGuid', {
        infoGuid: args.claimInfoGuid
      });
    }

    const info = await query.orderBy('info.created', 'DESC').getOne();

    if (info && info.responses && info.responses.length > 0) {
      // Since I'm a dummy and don't know how to do to return only the responses with category id for
      // phone numbers, doing the filtering after the data comes back.
      //
      // Also mapping into a collection of entity values. Consumers of the callee do not care for anything
      // other than the list of responses.
      const mappedResponses = info.responses.reduce((acc, curr) => {
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

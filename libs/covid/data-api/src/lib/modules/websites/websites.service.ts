import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { County, CountyClaim, CategoryValue } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WebsitesService extends BaseService<CategoryValue> {
  constructor(
    @InjectRepository(CategoryValue) public repo: Repository<CategoryValue>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(CountyClaim) public claimRepo: Repository<CountyClaim>
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

    // const claim = await this.claimRepo.findOne({
    //   join: {
    //     alias: 'claim',
    //     leftJoinAndSelect: {
    //       infos: 'claim.infos'
    //     }
    //   },
    //   where: qb => {

    //   },
    //   // relations: ['info', 'info.websites', 'info.websites.type'],
    //   order: {
    //     created: 'DESC'
    //   }
    // });

    const claim = await this.claimRepo
      .createQueryBuilder('claim')
      .leftJoinAndSelect('infos', 'claim.infos')
      .where('claim.countyFips = :countyFips', {
        countyFips: countyFips
      })
      .getMany();

    debugger;

    // TODO: Get websites for county
    // return claim && claim.info && claim.info.websites ? claim.info.websites : [];
    return [];
  }
}

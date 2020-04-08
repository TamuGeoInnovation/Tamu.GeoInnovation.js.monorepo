import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Website, County, CountyClaim } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class WebsitesService extends BaseService<Website> {
  constructor(
    @InjectRepository(Website) public repo: Repository<Website>,
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

    const claim = await this.claimRepo.findOne({
      where: {
        county: countyFips
      },
      relations: ['info', 'info.websites', 'info.websites.type'],
      order: {
        created: 'DESC'
      }
    });

    return claim && claim.info && claim.info.websites ? claim.info.websites : [];
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TestingSite,
  User,
  // Website,
  // WebsiteType,
  // RestrictionType,
  // SiteOwnerType,
  // SiteServiceType,
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SitesService extends BaseService<TestingSite> {
  constructor(
    @InjectRepository(TestingSite) public repo: Repository<TestingSite>,
    @InjectRepository(User) public userRepo: Repository<User>,
    // @InjectRepository(Website) public sourceRepo: Repository<Website>,
    // @InjectRepository(WebsiteType) public classificationRepo: Repository<WebsiteType>,
    // @InjectRepository(RestrictionType) public restrictionRepo: Repository<RestrictionType>,
    // @InjectRepository(SiteOwnerType) public ownerRepo: Repository<SiteOwnerType>,
    // @InjectRepository(SiteServiceType) public serviceRepo: Repository<SiteServiceType>,
    // @InjectRepository(SiteStatusType) public statusRepo: Repository<SiteStatusType>
  ) {
    super(repo);
  }

  public async getSitesForCounty(state: string, county: string) {
    return this.repo.find({
      where: {
        state: state,
        county: county
      },
      relations: [
        'claim',
        'claim.user',
        'claim.county',
        'location',
        'info',
        'info.status',
        'info.owners',
        'info.services',
        'info.restrictions',
        'info.phoneNumbers',
        'info.phoneNumbers.type',
        'info.websites',
        'info.websites.type'
      ]
    });
  }
}

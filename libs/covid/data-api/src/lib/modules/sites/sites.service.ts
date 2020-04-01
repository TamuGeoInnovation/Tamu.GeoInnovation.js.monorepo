import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TestingSite,
  User,
  Source,
  Classification,
  Restriction,
  SiteOwner,
  SiteService,
  SiteStatus
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class SitesService extends BaseService<TestingSite> {
  constructor(
    @InjectRepository(TestingSite) public repo: Repository<TestingSite>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(Source) public sourceRepo: Repository<Source>,
    @InjectRepository(Classification) public classificationRepo: Repository<Classification>,
    @InjectRepository(Restriction) public restrictionRepo: Repository<Restriction>,
    @InjectRepository(SiteOwner) public ownerRepo: Repository<SiteOwner>,
    @InjectRepository(SiteService) public serviceRepo: Repository<SiteService>,
    @InjectRepository(SiteStatus) public statusRepo: Repository<SiteStatus>
  ) {
    super(repo);
  }

  public async getSitesForCounty(state: string, county: string) {
    return this.repo.find({
      where: {
        state: state,
        county: county
      },
      relations: ['source', 'source.classification', 'restrictions', 'owners', 'services', 'status']
    });
  }
}

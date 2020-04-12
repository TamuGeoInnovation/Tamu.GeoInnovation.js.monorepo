import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lockdown, User } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(
    @InjectRepository(Lockdown) public repo: Repository<Lockdown>,
    @InjectRepository(User) public userRepo: Repository<User>,
    // @InjectRepository(Website) public sourceRepo: Repository<Website>,
    // @InjectRepository(WebsiteType) public classificationRepo: Repository<WebsiteType>,
    public ccs: CountyClaimsService
  ) {
    super(repo);
  }

  // TODO: Fix adding county lockdown
  /**
   * Registers a county lockdown
   */
  // public async registerLockdown(params) {
  //   const claims = await this.ccs.getActiveClaimsForEmail(params.claim.user);

  //   const claim = claims.find((c) => c.county.countyFips === params.claim.county);

  //   if (!claim) {
  //     return {
  //       status: 400,
  //       success: false,
  //       message: 'Lockdown and claim mismatch.'
  //     };
  //   }

  //   if (claim.processing === false || claim.closed === true) {
  //     return {
  //       status: 400,
  //       success: false,
  //       message: 'Claim for county is inactive. Re-open it to modify details.'
  //     };
  //   }

  //   const l = this.repo.create({
  //     ...params,
  //     status: { flagged: false, validated: false },
  //     state: claim.county.stateFips,
  //     county: claim.county.countyFips,
  //     claim
  //   } as DeepPartial<Lockdown>);

  //   return l.save();
  // }

  public async getActiveLockDownForEmail(email: string) {
    const [claim] = await this.ccs.getActiveClaimsForEmail(email);

    const lockdown = await this.repo.findOne({
      where: {
        claim: claim
      },
      order: {
        created: 'DESC'
      },
      relations: [
        'claim',
        'claim.user',
        'claim.county',
        'claim.county.phoneNumbers',
        'location',
        'info',
        'info.phoneNumbers',
        'info.phoneNumbers.type',
        'info.websites',
        'info.websites.type'
      ]
    });

    return lockdown ? lockdown : {};
  }
}

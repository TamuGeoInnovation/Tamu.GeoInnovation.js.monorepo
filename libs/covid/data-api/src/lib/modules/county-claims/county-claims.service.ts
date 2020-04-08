import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CountyClaim, User, County } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountyClaimsService extends BaseService<CountyClaim> {
  constructor(
    @InjectRepository(CountyClaim) public repo: Repository<CountyClaim>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(User) public userRepo: Repository<User>
  ) {
    super(repo);
  }

  public async getActiveClaimsForEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });

    const lastClaim = await this.repo.findOne({
      where: {
        user: user
      },
      relations: ['county', 'status'],
      order: {
        created: 'DESC'
      }
    });

    return lastClaim && lastClaim.status.closed !== true ? [lastClaim] : [];
  }

  public async getActiveClaimsForCountyFips(countyFips: number) {
    const lastForCounty = await this.repo.findOne({
      where: {
        county: {
          countyFips: countyFips
        }
      },
      order: {
        created: 'DESC'
      },
      relations: ['county', 'user', 'status']
    });

    return lastForCounty && lastForCounty.status.closed !== true ? [lastForCounty] : [];
  }

  /**
   * Register a county to a user.
   */
  public async createOrUpdateClaim(claim: Partial<CountyClaim>) {
    const user = await this.userRepo.findOne({
      where: {
        email: claim.user.email
      }
    });

    if (!user) {
      throw new Error('Invalid email.');
    }

    if (claim.county === undefined || claim.county.countyFips === undefined) {
      return {
        status: 400,
        success: false,
        message: 'Missing county fips.'
      };
    }

    const county = await this.countyRepo.findOne({
      where: {
        countyFips: claim.county.countyFips
      }
    });

    if (!county) {
      return {
        status: 400,
        success: false,
        message: 'Invalid county fips.'
      };
    }

    // Phone numbers
    const phs =
      claim &&
      claim.info &&
      claim.info.phoneNumbers &&
      claim.info.phoneNumbers instanceof Array &&
      claim.info.phoneNumbers.length > 0
        ? claim.info.phoneNumbers
        : [];

    // Websites
    const ws =
      claim && claim.info && claim.info.websites && claim.info.websites instanceof Array && claim.info.websites.length > 0
        ? claim.info.websites
        : [];

    const cl = this.repo.create({
      county: county,
      user: user,
      info: {
        phoneNumbers: phs,
        websites: ws
      },
      status: {}
    });

    return cl.save();
  }

  // public async getActiveClaimsForUser(email: string) {
  //   // TODO: fix
  //   // const user = await this.userRepo.findOne({
  //   //   where: {
  //   //     email: email
  //   //   },
  //   //   relations: ['claims', 'claims.county', 'claims.status'],
  //   //   order: {
  //   //     created: 'DESC'
  //   //   }
  //   // });
  //   // const filtered = user.claims.filter((c) => c.status && c.status.processing);
  //   // return filtered;
  // }
}

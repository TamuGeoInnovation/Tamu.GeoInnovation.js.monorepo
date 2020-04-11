import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CountyClaim, User, County, STATUS } from '@tamu-gisc/covid/common/entities';

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
        user: user,
        statuses: [
          {
            type: STATUS.PROCESSING
          }
        ]
      },
      relations: ['county', 'statuses'],
      order: {
        created: 'DESC'
      }
    });

    // TODO: Return the last claim that does not have a closed status.
    return lastClaim ? [lastClaim] : [];
  }

  public async getActiveClaimsForCountyFips(countyFips: number) {
    const lastForCounty = await this.repo.findOne({
      where: {
        county: {
          countyFips: countyFips
        },
        statuses: [{ type: STATUS.PROCESSING }]
      },
      order: {
        created: 'DESC'
      },
      relations: ['statuses', 'statuses.type', 'county', 'user']
    });

    return lastForCounty ? [lastForCounty] : [];
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

    // TODO: Fix claim phone and website entry/update
    // // Phone numbers
    // const phs =
    //   claim &&
    //   claim.info &&
    //   claim.info.phoneNumbers &&
    //   claim.info.phoneNumbers instanceof Array &&
    //   claim.info.phoneNumbers.length > 0
    //     ? claim.info.phoneNumbers
    //     : [];

    // // Websites
    // const ws =
    //   claim && claim.info && claim.info.websites && claim.info.websites instanceof Array && claim.info.websites.length > 0
    //     ? claim.info.websites
    //     : [];

    const cl = this.repo.create({
      county: county,
      user: user,
      statuses: [
        {
          type: {
            id: STATUS.PROCESSING
          }
        }
      ]

      // info: {
      //   phoneNumbers: phs,
      //   websites: ws
      // },
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

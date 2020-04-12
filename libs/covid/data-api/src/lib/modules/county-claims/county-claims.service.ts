import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { STATUS, CATEGORY } from '@tamu-gisc/covid/common/enums';
import {
  CountyClaim,
  User,
  County,
  FieldCategory,
  CountyClaimInfo,
  CategoryValue,
  EntityValue,
  EntityToValue
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountyClaimsService extends BaseService<CountyClaim> {
  constructor(
    @InjectRepository(CountyClaim) public repo: Repository<CountyClaim>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(CountyClaimInfo) public claimInfoRepo: Repository<CountyClaimInfo>,
    @InjectRepository(EntityToValue) public valueRepo: Repository<EntityToValue>
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
  public async createOrUpdateClaim(claim, phoneNumbers: Array<EntityValue>, websites: Array<EntityValue>) {
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

    // County claim container
    let cl;

    if (!claim.guid) {
      cl = this.repo.create({
        county: county,
        user: user,
        statuses: [
          {
            type: {
              id: STATUS.PROCESSING
            }
          }
        ]
      });

      await cl.save();
    } else {
      cl = await this.repo.findOne({
        where: {
          guid: claim.guid
        }
      });
    }

    if (!cl) {
      return {
        status: 500,
        success: false,
        message: 'Could not create claim.'
      };
    }

    // Check if there is any county claim info to add/update
    if (phoneNumbers || websites) {
      // if (claim.infos.length > 1) {
      //   return {
      //     status: 500,
      //     success: false,
      //     message: 'Invalid number of claim infos.'
      //   };
      // }

      // Create a new claim info
      const claimInfo = await this.claimInfoRepo
        .create({
          claim: cl,
          statuses: [
            {
              type: {
                id: STATUS.PROCESSING
              }
            }
          ]
        })
        .save();

      debugger;

      await claimInfo.save();

      debugger;

      const pns: Array<EntityToValue> = phoneNumbers.map((pn) => {
        return this.valueRepo.create({
          entityValue: {
            value: {
              value: pn.value.value,
              type: pn.value.type,
              category: {
                id: CATEGORY.PHONE_NUMBERS
              }
            }
          },
          claimInfo: claimInfo
        });
      });

      claimInfo.responses = pns;

      const res = await claimInfo.save();

      return res;
    }

    return cl;
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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { STATUS, CATEGORY } from '@tamu-gisc/covid/common/enums';
import { CountyClaim, User, County, CountyClaimInfo, EntityValue, EntityToValue } from '@tamu-gisc/covid/common/entities';

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

    // Incoming payload should contain a claim guid if the user has one.
    //
    // If this is the case, make an entity from its database details for use below.
    //
    // If no claim guid, provided, make a new entity. This guid will be registered to the user.
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

    // If no claim made, something went wrong.
    if (!cl) {
      return {
        status: 500,
        success: false,
        message: 'Could not create claim.'
      };
    }

    // Check if there is any county claim info to add/update (websites/phone numbers)
    if (phoneNumbers || websites) {
      // Create a new claim info that will
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

      await claimInfo.save();

      const numbers: Array<EntityToValue> = phoneNumbers.map((pn) => {
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

      const webs: Array<EntityToValue> = websites.map((wb) => {
        return this.valueRepo.create({
          entityValue: {
            value: {
              value: wb.value.value,
              type: wb.value.type,
              category: {
                id: CATEGORY.WEBSITES
              }
            }
          },
          claimInfo: claimInfo
        });
      });

      claimInfo.responses = [...webs, ...numbers];

      const res = await claimInfo.save();

      // Return the saved claim with websites and phone number submissions
      return res;
    }

    // Return the original claim if no changes to the phone numbers or submissions
    return cl;
  }

  public async closeClaim(claimGuid: string) {
    if (!claimGuid) {
      return {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
    }

    const claim = await this.repo.findOne({
      where: {
        guid: claimGuid
      }
    });

    if (!claim) {
      return {
        status: 500,
        success: false,
        message: 'Invalid claim.'
      };
    }
  }
}

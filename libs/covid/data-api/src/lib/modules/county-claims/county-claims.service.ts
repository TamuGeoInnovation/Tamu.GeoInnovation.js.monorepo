import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { STATUS, CATEGORY } from '@tamu-gisc/covid/common/enums';
import {
  CountyClaim,
  User,
  County,
  CountyClaimInfo,
  EntityValue,
  EntityToValue,
  EntityStatus
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountyClaimsService extends BaseService<CountyClaim> {
  constructor(
    @InjectRepository(CountyClaim) public repo: Repository<CountyClaim>,
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(CountyClaimInfo) public claimInfoRepo: Repository<CountyClaimInfo>,
    @InjectRepository(EntityToValue) public valueRepo: Repository<EntityToValue>,
    @InjectRepository(EntityStatus) public statusRepo: Repository<EntityStatus>
  ) {
    super(repo);
  }

  public async getActiveClaimsForEmail(email: string) {
    if (!email || email === undefined || email === 'undefined') {
      throw new Error('Invalid email');
    }

    const user = await this.userRepo.findOne({ where: { email } });

    const lastClaim = await this.repo
      .createQueryBuilder('claim')
      .innerJoinAndSelect('claim.user', 'user')
      .innerJoinAndSelect('claim.county', 'county')
      .innerJoinAndSelect('claim.statuses', 'statuses')
      .innerJoinAndSelect('statuses.type', 'type')
      .where('user.guid = :userGuid AND type.id = :statusType', {
        userGuid: user.guid,
        statusType: STATUS.PROCESSING
      })
      .getOne();

    return lastClaim ? [lastClaim] : [];
  }

  public async getActiveClaimsForCountyFips(countyFips: number | string): Promise<CountyClaim[]> {
    if (countyFips === undefined || countyFips === 'undefined') {
      throw new Error('Invalid county claim.');
    }

    const activeForCounty = await this.repo
      .createQueryBuilder('claim')
      .leftJoinAndSelect('claim.statuses', 'statuses')
      .leftJoinAndSelect('statuses.type', 'type')
      .leftJoinAndSelect('claim.county', 'county')
      .leftJoinAndSelect('claim.user', 'user')
      .where('county.countyFips = :countyFips AND type.id = :statusType', {
        countyFips: countyFips,
        statusType: STATUS.PROCESSING
      })
      .orderBy('claim.created', 'DESC')
      .getOne();

    return activeForCounty ? [activeForCounty] : [];
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
    let cl: CountyClaim;

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

    // Create a new claim info regardless if there are any provided phones or websites.
    //
    // If there are no provided responses, it is assumed it either has none or all have been removed.
    const claimInfo = await this.claimInfoRepo.create({
      claim: cl,
      statuses: [
        {
          type: {
            id: STATUS.PROCESSING
          }
        }
      ],
      responses: []
    });

    if (phoneNumbers) {
      // Filter out any invalid phone number entries and map them to a value entity
      const numbers: Array<EntityToValue> = phoneNumbers.reduce((acc, pn) => {
        if (!pn.value || !pn.value.type) {
          return acc;
        }

        const value = this.valueRepo.create({
          entityValue: {
            value: {
              value: pn.value.value,
              type: pn.value.type,
              category: {
                id: CATEGORY.PHONE_NUMBERS
              }
            }
          }
        });

        return [...acc, value];
      }, []);

      claimInfo.responses.push(...numbers);
    }

    if (websites) {
      // Filter out any invalid phone number entries and map them to a value entity
      const webs: Array<EntityToValue> = websites.reduce((acc, wb) => {
        if (!wb.value || !wb.value.type) {
          return acc;
        }

        const web = this.valueRepo.create({
          entityValue: {
            value: {
              value: wb.value.value,
              type: wb.value.type,
              category: {
                id: CATEGORY.WEBSITES
              }
            }
          }
        });

        return [...acc, web];
      }, []);

      claimInfo.responses.push(...webs);
    }

    const res = await claimInfo.save();

    // Return the saved claim with websites and phone number submissions
    const [t] = await this.getActiveClaimsForEmail(claim.user.email);

    return t;
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
      },
      relations: ['statuses', 'statuses.type']
    });

    if (!claim) {
      return {
        status: 500,
        success: false,
        message: 'Invalid claim.'
      };
    }

    // Remove any "PROCESSING" status types, and apply a "CLOSED" status type.
    // Leave any others intact (cancelled, flagged, etc.)
    claim.statuses = claim.statuses.filter((status) => {
      return status.type.id !== (STATUS.PROCESSING as number) && status.type.id !== (STATUS.CLOSED as number);
    });

    // Create new closed status type
    const type = this.statusRepo.create({
      type: {
        id: STATUS.CLOSED
      }
    });

    // Add closed status type to claim
    claim.statuses.push(type);

    return claim.save();
  }
}

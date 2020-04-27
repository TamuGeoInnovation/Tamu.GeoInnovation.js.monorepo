import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';

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
import { getRandomNumber } from '@tamu-gisc/common/utils/number';

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

    if (lastClaim) {
      // Doing a second query because I need all statuses for the found claim. The above query filters out any
      // status that is not of type processing.
      const final = await this.repo.findOne({
        where: {
          guid: lastClaim.guid
        },
        relations: ['statuses', 'statuses.type', 'user', 'county']
      });

      return [final];
    } else {
      return [];
    }
  }

  public async getAllUserCountyClaimsSortedByCounty(email: string) {
    if (!email || email === undefined || email === 'undefined') {
      throw new Error('Invalid email');
    }

    const user = await this.userRepo.findOne({ where: { email } });

    const claims = await this.repo
      .createQueryBuilder('claim')
      .innerJoinAndSelect('claim.user', 'user')
      .innerJoinAndSelect('claim.county', 'county')
      .innerJoinAndSelect('claim.statuses', 'statuses')
      .innerJoinAndSelect('statuses.type', 'type')
      .where('user.guid = :userGuid', {
        userGuid: user.guid,
      })
      .getMany();

    // if (claims) {
    //   // Doing a second query because I need all statuses for the found claim. The above query filters out any
    //   // status that is not of type processing.
    //   const final = await this.repo.find({
    //     where: {
    //       guid: lastClaim.guid
    //     },
    //     relations: ['statuses', 'statuses.type', 'user', 'county']
    //   });

    //   return [final];
    // } else {
    //   return [];
    // }
    return claims;
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
      const previousClaim = await this.repo.findOne({
        where: {
          county: county
        },
        order: {
          created: 'DESC'
        },
        relations: ['statuses', 'statuses.type']
      });

      let statuses = [];

      if (previousClaim) {
        // Transfer over a select few of statuses from the previous claim.
        //
        // Of interest:
        // - Claims marked as site-less
        statuses = previousClaim.statuses
          .filter((s) => {
            return s.type.id === STATUS.CLAIM_SITE_LESS;
          })
          .map((s) => {
            return this.statusRepo.create({
              type: {
                id: s.type.id
              }
            });
          });
      }

      cl = this.repo.create({
        county: county,
        user: user,
        statuses: [
          {
            type: {
              id: STATUS.PROCESSING
            }
          },
          ...statuses
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

  public async getHistoricClaimsForCounty(countyFips: number | string, limit?: number | string) {
    if (!countyFips || countyFips === 'undefined' || countyFips === undefined) {
      throw new Error('Invalid county fips');
    }

    let findOptions = {
      where: {
        county: countyFips
      }
    };

    if (limit !== undefined) {
      const parsedNumber = typeof limit === 'string' ? parseInt(limit, 10) : limit;

      const takeOptions: Partial<FindManyOptions<CountyClaim>> = {
        take: parsedNumber,
        order: {
          created: 'DESC'
        }
      };

      findOptions = Object.assign(findOptions, takeOptions);
    }

    const claims = await this.repo.find(findOptions);

    return claims;
  }

  public async getSuggestedClaims(stateFips: number | string) {
    const countiesForState = await this.countyRepo.find({
      where: {
        stateFips: stateFips
      }
    });

    const countyFipsFromCounties = countiesForState.map((c) => c.countyFips);

    const claimsForState = await this.repo.find({
      where: {
        county: In(countyFipsFromCounties)
      },
      relations: ['statuses', 'statuses.type', 'county']
    });

    const mappedEligible = countiesForState
      .map((c) => {
        const hasClaim = claimsForState.find((claim) => claim.county.countyFips === c.countyFips);
        // const hasClaimProcessing = hasClaim ? hasClaim.statuses.findIndex((s) => s.type.id === STATUS.PROCESSING) : undefined;

        // If the iterating claim has an associated county claim, return a filler value.
        // We only care about returning claims with zero data.
        if (hasClaim) {
          return undefined;
        } else {
          return c;
        }
      })
      .filter((c) => c !== undefined);

    const random = new Array(5).fill(undefined).map(() => {
      return mappedEligible[getRandomNumber(0, mappedEligible.length)];
    });

    return random;
  }
}

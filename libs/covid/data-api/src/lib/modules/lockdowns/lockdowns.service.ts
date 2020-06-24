import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { STATUS, CATEGORY } from '@tamu-gisc/covid/common/enums';
import { Lockdown, LockdownInfo, User, EntityValue, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(
    @InjectRepository(Lockdown) public repo: Repository<Lockdown>,
    @InjectRepository(LockdownInfo) public lockdownInfoRepo: Repository<LockdownInfo>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(EntityStatus) public entityStatusRepo: Repository<EntityStatus>,
    public ccs: CountyClaimsService
  ) {
    super(repo);
  }

  public async createOrUpdateLockdown(params) {
    const user = await this.userRepo.findOne({
      where: {
        email: params.claim.user
      }
    });

    if (!user) {
      throw new Error('Invalid email.');
    }

    // Do some small verification to ensure that the incoming lockdown information
    // will be applied to the correct county based on the user active county claim
    // and county information in the incoming lockdown.
    const claims = await this.ccs.getActiveClaimsForEmail(params.claim.user);

    const claim = claims.find((c) => c.county.countyFips === params.claim.county);

    if (!claim) {
      return {
        status: 400,
        success: false,
        message: 'Lockdown and claim mismatch.'
      };
    }

    let lockdownContainer: Lockdown;

    const existingLockdown = await this.repo.findOne({
      where: {
        claim: claim.guid
      }
    });

    if (!params.info) {
      return {
        status: 400,
        success: false,
        message: 'Must provide lockdown info in body.'
      };
    } else {
      const phoneNumbers: EntityToValue[] = params.info.phoneNumbers.map((val, index) => {
        return {
          entityValue: {
            value: {
              value: val.value.value,
              type: val.value.type,
              category: CATEGORY.PHONE_NUMBERS
            }
          }
        };
      });

      const websites: EntityToValue[] = params.info.websites.map((val, index) => {
        return {
          entityValue: {
            value: {
              value: val.value.value,
              type: val.value.type,
              category: CATEGORY.WEBSITES
            }
          }
        };
      });

      const entStatus = this.entityStatusRepo.create({
        type: {
          id: STATUS.PROCESSING
        }
      });

      // If there is an existing lockdown, create only a lockdown info.
      if (existingLockdown) {
        let lockdownInfo: Partial<LockdownInfo>;
        lockdownInfo = {
          lockdown: existingLockdown,
          responses: [...phoneNumbers, ...websites],
          isLockdown: params.info.isLockdown,
          startDate: params.info.startDate,
          endDate: params.info.endDate,
          notes: params.info.notes,
          protocol: params.info.protocol,
          statuses: [entStatus]
        };

        lockdownContainer = this.repo.create({
          claim: claim,
          infos: [lockdownInfo],
          statuses: [
            {
              type: {
                id: STATUS.PROCESSING
              }
            }
          ]
        });

        return await this.lockdownInfoRepo.create(lockdownInfo).save();
      } else {
        // If there is no existing lockdown for the active claim, create a new lockdown and associated
        // lockdown info

        let lockdownInfo: Partial<LockdownInfo>;
        lockdownInfo = {
          responses: [...phoneNumbers, ...websites],
          isLockdown: params.info.isLockdown,
          endDate: params.info.endDate,
          startDate: params.info.startDate,
          notes: params.info.notes,
          protocol: params.info.protocol,
          statuses: [entStatus]
        };

        lockdownContainer = this.repo.create({
          claim: claim,
          infos: [lockdownInfo],
          statuses: [
            {
              type: {
                id: STATUS.PROCESSING
              }
            }
          ]
        });

        return await lockdownContainer.save();
      }
    }
  }

  public async getActiveLockDownForEmail(email: string) {
    const [claim] = await this.ccs.getActiveClaimsForEmail(email);

    const lockdown = await this.repo.findOne({
      where: {
        claim: claim
      },
      order: {
        created: 'DESC'
      },
      relations: ['claim', 'claim.county']
    });

    if (!lockdown) {
      return [];
    }

    const lastInfo = await this.getLatestLockdownInfoForLockdown(lockdown);

    // Categorize phone numbers and websites from the last info responses
    if (lastInfo) {
      return this.flattenLockdownAndInfo(lockdown, lastInfo);
    } else {
      return {};
    }
  }

  public async getAllLockdownsForUser(identifier: string) {
    let idType: string;

    if (identifier.includes('@')) {
      idType = 'email';
    } else if (identifier.includes('-')) {
      idType = 'guid';
    } else {
      return {};
    }

    const lockdowns = await this.repo
      .createQueryBuilder('lockdowns')
      .leftJoinAndSelect('lockdowns.claim', 'claim')
      .leftJoinAndSelect('claim.user', 'user')
      .leftJoinAndSelect('claim.county', 'county')
      .leftJoinAndSelect('county.stateFips', 'state')
      .where(`user.${idType} = :identifier`, {
        identifier
      })
      .getMany();

    const deferredLatestInfoForLockdowns = lockdowns.map((lock) => {
      return this.lockdownInfoRepo.findOne({
        where: {
          lock: lock
        },
        order: {
          created: 'DESC'
        },
        relations: [
          'responses',
          'responses.entityValue',
          'responses.entityValue.value',
          'responses.entityValue.value.category',
          'responses.entityValue.value.type',
          'statuses'
        ]
      });
    });

    const resolvedLatestInfoForTestingSites = await Promise.all(deferredLatestInfoForLockdowns);

    const joined = lockdowns.map((site, index) => {
      // Only join if the testing site info is not undefined
      site.infos =
        resolvedLatestInfoForTestingSites[index] !== undefined ? [resolvedLatestInfoForTestingSites[index]] : undefined;
      return site;
    });

    try {
      const flattened = joined.map((s) => this.flattenLockdownAndInfo(lockdowns, deferredLatestInfoForLockdowns));
      return flattened;
    } catch (err) {
      return joined;
    }
  }

  /**
   * Returns the last lockdown entry, including last lockdown info submission
   * for a provided county fips, independent of user.
   */
  public async getLockdownForCounty(countyFips: number | string) {
    const lockdown = await this.getLatestLockDownForCounty(countyFips);

    const info = await this.getLatestLockdownInfoForLockdown(lockdown);

    return this.flattenLockdownAndInfo(lockdown, info);
  }

  public async getLockdownsAdmin(stateFips: number | string, countyFips: number | string, email: string) {
    const builder = this.repo
      .createQueryBuilder('lockdown')
      .innerJoinAndSelect('lockdown.claim', 'claim')
      .innerJoinAndSelect('claim.user', 'user')
      .addSelect('user.email')
      .innerJoinAndSelect('claim.county', 'county')
      .innerJoinAndSelect('county.stateFips', 'state')
      .innerJoinAndSelect('lockdown.statuses', 'statuses')
      .innerJoinAndSelect('statuses.type', 'statusType');

    if (stateFips) {
      builder.andWhere('county.stateFips = :stateFips');
    }

    if (countyFips) {
      builder.andWhere('county.countyFips = :countyFips');
    }

    if (email) {
      builder.andWhere('user.email = :email');
    }

    builder.orderBy('lockdown.created', 'DESC');

    builder.setParameters({
      stateFips,
      countyFips,
      email
    });

    return builder.getMany();
  }

  public async getInfosForLockdown(lockdownGuid: string) {
    const claim = await this.repo.findOne({
      where: {
        guid: lockdownGuid
      },
      relations: ['infos']
    });

    if (claim) {
      return claim;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Claim not found.',
          success: false
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  public async getLockdownInfoForLockdown(infoGuid: string) {
    if (!infoGuid) {
      throw new Error('Invalid lockdown info guid.');
    }

    const info = await this.lockdownInfoRepo
      .createQueryBuilder('info')
      .leftJoinAndSelect('info.responses', 'responses')
      .leftJoinAndSelect('responses.entityValue', 'entityValue')
      .leftJoinAndSelect('entityValue.value', 'value')
      .leftJoinAndSelect('value.type', 'type')
      .leftJoinAndSelect('value.category', 'category')
      .leftJoinAndSelect('info.lockdown', 'lockdown')
      .leftJoinAndSelect('lockdown.claim', 'claim')
      .leftJoinAndSelect('claim.county', 'county')
      .where('info.guid = :infoGuid', {
        infoGuid
      })
      .getOne();

    return this.flattenLockdownAndInfo(info.lockdown, info);
  }

  /**
   * Gets the last lockdown info submission for a lockdown entry, independent of user
   */
  private async getLatestLockDownForCounty(countyFips: number | string) {
    return await this.repo
      .createQueryBuilder('lockdown')
      .leftJoinAndSelect('lockdown.claim', 'claim')
      .leftJoinAndSelect('claim.county', 'county')
      .where('county.countyFips = :countyFips', {
        countyFips: countyFips
      })
      .orderBy('lockdown.created', 'DESC')
      .getOne();
  }

  /**
   * Gets the last lockdown info submission for a given lockdown, independent of user.
   */
  private async getLatestLockdownInfoForLockdown(lockdown: Lockdown) {
    if (!lockdown) {
      throw new Error('Invalid lockdown');
    }

    return await this.lockdownInfoRepo
      .createQueryBuilder('info')
      .leftJoinAndSelect('info.responses', 'responses')
      .leftJoinAndSelect('responses.entityValue', 'entityValue')
      .leftJoinAndSelect('entityValue.value', 'value')
      .leftJoinAndSelect('value.type', 'type')
      .leftJoinAndSelect('value.category', 'category')
      .leftJoinAndSelect('info.lockdown', 'lockdown')
      .where('lockdown.guid = :lockdownGuid', {
        lockdownGuid: lockdown.guid
      })
      .orderBy('info.created', 'DESC')
      .getOne();
  }

  /**
   * Combines a lockdown and lockdown info entity, as well as categorizes the responses
   * by value category ID (websites vs phone numbers)
   */
  private flattenLockdownAndInfo(lockdown, info) {
    const categorized = info.responses.reduce(
      (acc, curr) => {
        if (curr.entityValue.value.category.id === CATEGORY.PHONE_NUMBERS) {
          acc.phoneNumbers.push(curr.entityValue);
        }

        if (curr.entityValue.value.category.id === CATEGORY.WEBSITES) {
          acc.websites.push(curr.entityValue);
        }

        return acc;
      },
      { phoneNumbers: [], websites: [] } as { phoneNumbers: EntityValue[]; websites: EntityValue[] }
    );

    return {
      claim: lockdown.claim,
      info: {
        ...info,
        ...categorized
      }
    };
  }
}

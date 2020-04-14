import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, FindConditions } from 'typeorm';

import { Lockdown, LockdownInfo, User, EntityValue, EntityToValue, EntityStatus } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { STATUS, CATEGORY } from '@tamu-gisc/covid/common/enums';

@Injectable()
export class LockdownsService extends BaseService<Lockdown> {
  constructor(
    @InjectRepository(Lockdown) public repo: Repository<Lockdown>,
    @InjectRepository(LockdownInfo) public lockdownInfoRepo: Repository<LockdownInfo>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(EntityStatus) public entityStatusRepo: Repository<EntityStatus>,
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

  public async createOrUpdateLockdown(params) {
    const user = await this.userRepo.findOne({
      where: {
        email: params.claim.user
      }
    });

    if (!user) {
      throw new Error('Invalid email.');
    }

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
        message: 'Lockdown info must not be null or missing.'
      };
    } else {

      const phoneNumbers: EntityToValue[] = params.info.phoneNumbers.map((val, index) => {
        return {
          entityValue: {
            value: {
              value: val.value.value,
              type: val.value.type,
              category: CATEGORY.PHONE_NUMBERS
            },
          },
        }
      })

      const websites: EntityToValue[] = params.info.websites.map((val, index) => {
        return {
          entityValue: {
            value: {
              value: val.value.value,
              type: val.value.type,
              category: CATEGORY.WEBSITES
            },
          },
        }
      })

      const entStatus = this.entityStatusRepo.create({
        type: {
          id: STATUS.PROCESSING,
        }
      })


      let lockdownInfo: Partial<LockdownInfo>;
        lockdownInfo = {
          responses: [...phoneNumbers, ...websites],
          isLockdown: params.info.isLockdown,
          endDate: params.info.endDate,
          startDate: params.info.startDate,
          notes: params.info.notes,
          protocol: params.info.protocol,
          statuses: [entStatus],
        }
      const lockdownInfoContainer = this.lockdownInfoRepo.create(lockdownInfo);

      lockdownContainer = this.repo.create({
        claim: claim,
        infos: [lockdownInfo],
        statuses: [
          {
            type: {
              id: STATUS.PROCESSING
            }
          }
        ],
      });
      await lockdownContainer.save();

      // if (existingLockdown) {
      //   // Update
      //   const findConditions: FindConditions<Lockdown> = {
      //     guid: existingLockdown.guid,
      //   }
      //   await this.repo.update(findConditions, lockdownContainer);
  
      // } else {
      //   // Insert
      //   await lockdownContainer.save();
      // }

      

      
      

      // const lockdownInfo: LockdownInfo = this.lockdownInfoRepo.create({
      //   isLockdown: params.info.isLockdown,
      //   endDate: params.info.endDate,
      //   startDate: params.info.startDate,
      //   notes: params.info.notes,
      //   protocol: params.info.protocol,
      //   statuses: [
      //     {
      //       type: {
      //         id: STATUS.PROCESSING
      //       }
      //     }
      //   ],
      // });

      // lockdownContainer.infos = [lockdownInfo];
      // await lockdownContainer.save();

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
    });

    // const lastInfo = await this.lockdownInfoRepo
    //   .createQueryBuilder('info')
    //   .leftJoinAndSelect('info.responses', 'responses')
    //   .leftJoinAndSelect('responses.entityValue', 'entityValue')
    //   .leftJoinAndSelect('entityValue.value', 'value')
    //   .leftJoinAndSelect('value.type', 'type')
    //   .leftJoinAndSelect('value.category', 'category')
    //   .where('lockdownGuid.countyFips = :countyFips', {
    //     countyFips: claim.county.countyFips
    //   })
    //   .orderBy('info.created', 'DESC')
    //   .getOne();

    // if (lastInfo && lastInfo.responses && lastInfo.responses.length > 0) {
    //   // Since I'm a dummy and don't know how to do to return only the responses with category id for
    //   // phone numbers, doing the filtering after the data comes back.
    //   //
    //   // Also mapping into a collection of entity values. Consumers of the callee do not care for anything
    //   // other than the list of responses.
    //   const mappedResponses = lastInfo.responses.reduce((acc, curr) => {
    //     if (curr.entityValue.value.category.id !== CATEGORY.PHONE_NUMBERS) {
    //       return acc;
    //     }

    //     return [...acc, curr.entityValue];
    //   }, []);

    //   return mappedResponses;
    // } else {
    //   return [];
    // }

  }
}

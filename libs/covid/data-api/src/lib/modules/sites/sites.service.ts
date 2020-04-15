import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import {
  TestingSite,
  TestingSiteInfo,
  Location,
  User,
  EntityToValue,
  EntityValue,
  EntityStatus,
  County,
  CountyClaim,
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CATEGORY, STATUS } from '@tamu-gisc/covid/common/enums';

@Injectable()
export class SitesService extends BaseService<TestingSite> {
  constructor(
    @InjectRepository(County) public countyRepo: Repository<County>,
    @InjectRepository(CountyClaim) public countyClaimRepo: Repository<CountyClaim>,
    @InjectRepository(TestingSite) public repo: Repository<TestingSite>,
    @InjectRepository(TestingSiteInfo) public testingSiteInfoRepo: Repository<TestingSiteInfo>,
    @InjectRepository(Location) public locationRepo: Repository<Location>,
    @InjectRepository(User) public userRepo: Repository<User>,
    @InjectRepository(EntityStatus) public entityStatusRepo: Repository<EntityStatus>,
    public ccs: CountyClaimsService
  ) {
    super(repo);
  }

  public async createOrUpdateTestingSite(params) {
    const user = await this.userRepo.findOne({
      where: {
        email: params.claim.user.email
      }
    });

    if (!user) {
      throw new Error('Invalid email.');
    }

    const claims = await this.ccs.getActiveClaimsForEmail(params.claim.user.email);

    const claim = claims.find((c) => c.county.countyFips === params.claim.county.countyFips);

    if (!claim) {
      return {
        status: 400,
        success: false,
        message: 'TestingSite and claim mismatch.'
      };
    }

    let testingSiteContainer: TestingSite;

    const existingTestingSite = await this.repo.findOne({
      where: {
        claim: claim.guid
      }
    });

    if (!params.info) {
      return {
        status: 400,
        success: false,
        message: 'Must provide site info in body.'
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

      const operationState = params.info.status
        ? {
          entityValue: {
            value: {
              value: '',
              type: params.info.status,
              category: CATEGORY.SITE_OPERATIONAL_STATUS
            }
          }
        }
        : undefined;

      const owners: EntityToValue[] = params.info.owners.split(',').map((val, index) => {
        return {
          entityValue: {
            value: {
              value: '',
              type: val,
              category: CATEGORY.SITE_OWNERS
            }
          }
        };
      });

      const restrictions: EntityToValue[] = params.info.restrictions.split(',').map((val, index) => {
        return {
          entityValue: {
            value: {
              value: '',
              type: val,
              category: CATEGORY.SITE_RESTRICTIONS
            }
          }
        };
      });

      const services: EntityToValue[] = params.info.services.split(',').map((val, index) => {
        return {
          entityValue: {
            value: {
              value: '',
              type: val,
              category: CATEGORY.SITE_SERVICES
            }
          }
        };
      });

      const entStatus = this.entityStatusRepo.create({
        type: {
          id: STATUS.PROCESSING
        }
      });

      let testingSiteInfo: DeepPartial<TestingSiteInfo>;

      const location: Partial<Location> = {
        address1: params.location.address1,
        address2: params.location.address2,
        city: params.location.city,
        country: params.location.country,
        county: params.location.county,
        state: params.location.state,
        zip: params.location.zip
      };

      if (existingTestingSite) {
        testingSiteInfo = {
          responses: [
            ...phoneNumbers,
            ...websites,
            ...owners,
            ...restrictions,
            ...services,
            (operationState as unknown) as EntityToValue
          ],
          undisclosed: params.info.undisclosed,
          sitesAvailable: params.info.sitesAvailable,
          location: location,
          locationName: params.info.locationName,
          locationPhoneNumber: params.info.locationPhoneNumber,
          hoursOfOperation: params.info.hoursOfOperation,
          capacity: params.info.capacity,
          driveThrough: params.info.driveThrough,
          driveThroughCapacity: params.info.driveThroughCapacity,
          notes: params.info.notes,
          statuses: [entStatus],
          testingSite: existingTestingSite
        };

        testingSiteContainer = this.repo.create({
          claim: claim,
          infos: [testingSiteInfo],
          statuses: [
            {
              type: {
                id: STATUS.PROCESSING
              }
            }
          ]
        });

        return await testingSiteContainer.save();
      } else {
        testingSiteInfo = {
          responses: [
            ...phoneNumbers,
            ...websites,
            ...owners,
            ...restrictions,
            ...services,
            (operationState as unknown) as EntityToValue
          ],
          undisclosed: params.info.undisclosed,
          sitesAvailable: params.info.sitesAvailable,
          location: location,
          locationName: params.info.locationName,
          locationPhoneNumber: params.info.locationPhoneNumber,
          hoursOfOperation: params.info.hoursOfOperation,
          capacity: params.info.capacity,
          driveThrough: params.info.driveThrough,
          driveThroughCapacity: params.info.driveThroughCapacity,
          notes: params.info.notes,
          statuses: [entStatus]
        };

        testingSiteContainer = this.repo.create({
          claim: claim,
          infos: [testingSiteInfo],
          statuses: [
            {
              type: {
                id: STATUS.PROCESSING
              }
            }
          ]
        });

        return await testingSiteContainer.save();
      }
    }
  }

  public async getSitesForCounty(state: string, countyName: string) {
    const county: County = await this.countyRepo.findOne({
      where: {
        name: countyName
      }
    });
    const countyClaims: CountyClaim[] = await this.countyClaimRepo.find({
      where: {
        county: county
      }
    });


    // const ret = await this.getAllTestSites(countyClaims);
    // ret.map((testSite, index) => {
    //   this.flattenTestSiteAndInfo(testSite, testSite.infos);
    // })
    const testSites = await this.getAllTestSites(countyClaims);
    const mappedTestSites = testSites.map((testSite, index) => {
      const infos = testSite.infos;
      const ret = this.flattenTestSiteAndInfo(testSite, infos);
      return ret;
    });



    debugger
    return {
      ...mappedTestSites
    };
  }

  public async getAllTestSites(countyClaims: CountyClaim[]): Promise<TestingSite[]> {
    const allTestSites: TestingSite[] = [];
    return new Promise((resolve, reject) => {
      countyClaims.map((countyClaim, index) => {
        this.repo.find({
          where: {
            claim: countyClaim
          },
          relations: [
            'infos',
            'infos.responses',
            'infos.responses.entityValue',
            'infos.responses.entityValue.value',
            'infos.responses.entityValue.value.category',
            // 'infos.responses.entityValue.value.category.id',
            'infos.responses.testingSiteInfo',
            'infos.location',
          ]
        }).then((testSites: TestingSite[]) => {
          if (testSites) {
            allTestSites.push(...testSites)
          }
          if (index == countyClaims.length - 1) {
            resolve(allTestSites);
          }
        });

      });
      // resolve(allTestSites)
    });
  }

  private flattenTestSiteAndInfo(testingSite, infos) {
    return infos.map((info, index) => {
      const categorized = info.responses.reduce(
        (acc, curr) => {
          if (curr.entityValue.value.category.id === CATEGORY.PHONE_NUMBERS) {
            acc.phoneNumbers.push(curr.entityValue);
          }

          if (curr.entityValue.value.category.id === CATEGORY.WEBSITES) {
            acc.websites.push(curr.entityValue);
          }

          if (curr.entityValue.value.category.id === CATEGORY.SITE_OWNERS) {
            acc.siteOwners.push(curr.entityValue);
          }

          if (curr.entityValue.value.category.id === CATEGORY.SITE_SERVICES) {
            acc.siteServices.push(curr.entityValue);
          }

          if (curr.entityValue.value.category.id === CATEGORY.SITE_RESTRICTIONS) {
            acc.siteRestrictions.push(curr.entityValue);
          }

          if (curr.entityValue.value.category.id === CATEGORY.SITE_OPERATIONAL_STATUS) {
            acc.siteStatus.push(curr.entityValue);
          }

          return acc;
        },
        { phoneNumbers: [], websites: [], siteOwners: [], siteServices: [], siteRestrictions: [], siteStatus: [] } as { phoneNumbers: EntityValue[]; websites: EntityValue[], siteOwners: EntityValue[], siteServices: EntityValue[], siteRestrictions: EntityValue[], siteStatus: EntityValue[] }
      );
      return {
        claim: testingSite.claim,
        info: {
          ...info,
          ...categorized
        }
      };
    });



  }

}

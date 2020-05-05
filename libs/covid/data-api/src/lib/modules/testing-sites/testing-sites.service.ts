import { Injectable, Post } from '@nestjs/common';
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
  CountyClaim
} from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';
import { CountyClaimsService } from '../county-claims/county-claims.service';
import { CATEGORY, STATUS } from '@tamu-gisc/covid/common/enums';

@Injectable()
export class TestingSitesService extends BaseService<TestingSite> {
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

    let existingTestingSite: TestingSite;

    if (params.guid) {
      existingTestingSite = await this.repo.findOne({
        where: {
          guid: params.guid
        },
        relations: ['infos']
      });
    }

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

      const owners: EntityToValue[] =
        params.info.owners.length > 0
          ? params.info.owners.split(',').map((val, index) => {
              return {
                entityValue: {
                  value: {
                    value: '',
                    type: val,
                    category: CATEGORY.SITE_OWNERS
                  }
                }
              };
            })
          : [];

      const restrictions: EntityToValue[] =
        params.info.restrictions.length > 0
          ? params.info.restrictions.split(',').map((val, index) => {
              return {
                entityValue: {
                  value: {
                    value: '',
                    type: val,
                    category: CATEGORY.SITE_RESTRICTIONS
                  }
                }
              };
            })
          : [];

      const services: EntityToValue[] =
        params.info.services.length > 0
          ? params.info.services.split(',').map((val, index) => {
              return {
                entityValue: {
                  value: {
                    value: '',
                    type: val,
                    category: CATEGORY.SITE_SERVICES
                  }
                }
              };
            })
          : [];

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

      const responsesFiltered = [
        ...phoneNumbers,
        ...websites,
        ...owners,
        ...restrictions,
        ...services,
        (operationState as unknown) as EntityToValue
      ].filter((response) => {
        return response !== undefined;
      });

      if (existingTestingSite) {
        const info = this.testingSiteInfoRepo.create({
          responses: responsesFiltered,
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
        });

        existingTestingSite.infos.push(info);

        const site = await existingTestingSite.save();

        await this.clearSitelessStatus(claim);

        return site;
      } else {
        testingSiteInfo = {
          responses: responsesFiltered,
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

        const testingSite = this.repo.create({
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

        const site = await testingSite.save();

        await this.clearSitelessStatus(claim);

        return site;
      }
    }
  }

  public async getSitesForCounty(countyFips: number | string) {
    const testingSites = await this.repo
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.claim', 'claim')
      .leftJoinAndSelect('claim.county', 'county')
      .where('county.countyFips = :countyFips', {
        countyFips: countyFips
      })
      .orderBy('site.created', 'DESC')
      .getMany();

    const deferredLatestInfoForTestingSites = testingSites.map((site) => {
      return this.testingSiteInfoRepo.findOne({
        where: {
          testingSite: site
        },
        order: {
          created: 'DESC'
        },
        relations: [
          'responses',
          'location',
          'responses.entityValue',
          'responses.entityValue.value',
          'responses.entityValue.value.category',
          'responses.entityValue.value.type',
          'statuses'
        ]
      });
    });

    const resolvedLatestInfoForTestingSites = await Promise.all(deferredLatestInfoForTestingSites);

    const joined = testingSites.map((site, index) => {
      // Only join if the testing site info is not undefined
      site.infos =
        resolvedLatestInfoForTestingSites[index] !== undefined ? [resolvedLatestInfoForTestingSites[index]] : undefined;
      return site;
    });

    const flattened = joined.map((s) => this.flattenTestSiteAndInfo(s));

    return flattened;
  }

  public async getSitesForUser(identifier: string) {
    let idType: string;

    if (identifier.includes('@')) {
      idType = 'email';
    } else if (identifier.includes('-')) {
      idType = 'guid';
    } else {
      return {};
    }

    const testingSites = await this.repo
      .createQueryBuilder('sites')
      .leftJoinAndSelect('sites.claim', 'claim')
      .leftJoinAndSelect('claim.user', 'user')
      .where(`user.${idType} = :identifier`, {
        identifier
      })
      .orderBy('sites.created', 'DESC')
      .getMany();

    const deferredLatestInfoForTestingSites = testingSites.map((site) => {
      return this.testingSiteInfoRepo.findOne({
        where: {
          testingSite: site
        },
        order: {
          created: 'DESC'
        },
        relations: [
          'responses',
          'location',
          'responses.entityValue',
          'responses.entityValue.value',
          'responses.entityValue.value.category',
          'responses.entityValue.value.type',
          'statuses'
        ]
      });
    });

    const resolvedLatestInfoForTestingSites = await Promise.all(deferredLatestInfoForTestingSites);

    const joined = testingSites.map((site, index) => {
      // Only join if the testing site info is not undefined
      site.infos =
        resolvedLatestInfoForTestingSites[index] !== undefined ? [resolvedLatestInfoForTestingSites[index]] : undefined;
      return site;
    });

    const flattened = joined.map((s) => this.flattenTestSiteAndInfo(s));

    return flattened;
  }

  public async getTestingSitesSortedByCounty() {
    const testingSites = await this.repo
      .createQueryBuilder('site')
      .leftJoinAndSelect('site.claim', 'claim')
      .leftJoinAndSelect('claim.county', 'county')
      .orderBy('site.created', 'DESC')
      .limit(6)
      .getMany();

    const deferredLatestInfoForTestingSites = testingSites.map((site) => {
      return this.testingSiteInfoRepo.findOne({
        where: {
          testingSite: site
        },
        order: {
          created: 'DESC'
        },
        relations: [
          'responses',
          'location',
          'responses.entityValue',
          'responses.entityValue.value',
          'responses.entityValue.value.category',
          'responses.entityValue.value.type',
          'statuses'
        ]
      });
    });

    const resolvedLatestInfoForTestingSites = await Promise.all(deferredLatestInfoForTestingSites);

    const joined = testingSites.map((site, index) => {
      // Only join if the testing site info is not undefined
      site.infos =
        resolvedLatestInfoForTestingSites[index] !== undefined ? [resolvedLatestInfoForTestingSites[index]] : undefined;
      return site;
    });

    const flattened = joined.map((t) => this.flattenTestSiteAndInfo(t));

    return flattened;
  }

  public async getInfosForSite(siteGuid: string) {
    const testingSites = await this.repo.find({
      where: {
        guid: siteGuid
      },
      order: {
        created: 'DESC'
      },
      relations: ['infos']
    });

    return testingSites;
  }

  private flattenTestSiteAndInfo(site: Partial<TestingSite>) {
    const siteInfo =
      site.infos && site.infos.length > 0 ? site.infos[0] : (({ responses: [] } as unknown) as TestingSiteInfo);

    const categorized = siteInfo.responses.reduce(
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
      { phoneNumbers: [], websites: [], siteOwners: [], siteServices: [], siteRestrictions: [], siteStatus: [] } as {
        phoneNumbers: EntityValue[];
        websites: EntityValue[];
        siteOwners: EntityValue[];
        siteServices: EntityValue[];
        siteRestrictions: EntityValue[];
        siteStatus: EntityValue[];
      }
    );

    const formatted = {
      guid: site.guid,
      claim: site.claim,
      location: siteInfo.location ? siteInfo.location : { address1: '', address2: '' },
      info: {
        ...siteInfo,
        status: categorized.siteStatus && categorized.siteStatus.length > 0 ? categorized.siteStatus[0].value.type.guid : '',
        owners: categorized.siteOwners.map((owner) => owner.value.type.guid).join(','),
        restrictions: categorized.siteRestrictions.map((restriction) => restriction.value.type.guid).join(','),
        services: categorized.siteServices.map((service) => service.value.type.guid).join(','),
        phoneNumbers: categorized.phoneNumbers,
        websites: categorized.websites
      }
    };

    return formatted;
  }

  public async registerCountyAsSiteless(countyFips: number | string) {
    if (!countyFips) {
      return {
        status: 400,
        success: false,
        message: 'Input parameter missing.'
      };
    }

    const latestClaim = await this.countyClaimRepo.findOne({
      where: {
        county: countyFips
      },
      order: {
        created: 'DESC'
      },
      relations: ['statuses', 'statuses.type']
    });

    latestClaim.statuses.push(
      this.entityStatusRepo.create({
        type: {
          id: STATUS.CLAIM_SITE_LESS
        }
      })
    );

    return latestClaim.save();
  }

  private async clearSitelessStatus(claim: CountyClaim) {
    const updatedStatuses = claim.statuses.filter((s) => {
      return s.type.id !== STATUS.CLAIM_SITE_LESS;
    });

    claim.statuses = updatedStatuses;

    return await claim.save();
  }

  public async getSiteAndLatestInfo(siteGuid: string) {
    if (!siteGuid) {
      throw new Error('Input parameter missing;');
    }

    const info = await this.testingSiteInfoRepo.findOne({
      where: {
        testingSite: siteGuid
      },
      order: {
        created: 'DESC'
      },
      relations: [
        'testingSite',
        'responses',
        'location',
        'responses.entityValue',
        'responses.entityValue.value',
        'responses.entityValue.value.category',
        'responses.entityValue.value.type',
        'statuses'
      ]
    });

    return this.flattenTestSiteAndInfo({
      ...info.testingSite,
      infos: [info]
    });
  }

  public async getTestingSitesAdmin(stateFips?: number | string, countyFips?: number | string, email?: string) {
    const builder = this.repo
      .createQueryBuilder('site')
      .innerJoinAndSelect('site.claim', 'claim')
      .innerJoinAndSelect('site.statuses', 'siteStatuses')
      .innerJoinAndSelect('claim.county', 'county')
      .innerJoinAndSelect('claim.user', 'user');

    if (stateFips) {
      builder.andWhere('county.stateFips = :stateFips');
    }

    if (countyFips) {
      builder.andWhere('county.countyFips = :countyFips');
    }

    if (email) {
      builder.andWhere('user.email = :email');
    }

    builder.setParameters({
      stateFips,
      countyFips,
      email
    });

    const sites = await builder.getMany();

    const deferredInfos = sites.map((s) => {
      return this.testingSiteInfoRepo.findOne({
        where: {
          testingSite: s
        },
        order: {
          created: 'DESC'
        },
        relations: [
          'responses',
          'location',
          'responses.entityValue',
          'responses.entityValue.value',
          'responses.entityValue.value.category',
          'responses.entityValue.value.type',
          'statuses'
        ]
      });
    });

    const resolvedInfos = await Promise.all(deferredInfos);

    const joined = sites.map((site, index) => {
      // Only join if the testing site info is not undefined
      site.infos = resolvedInfos[index] !== undefined ? [resolvedInfos[index]] : undefined;
      return site;
    });

    const flattened = joined.map((t) => this.flattenTestSiteAndInfo(t));

    return flattened;
  }
}

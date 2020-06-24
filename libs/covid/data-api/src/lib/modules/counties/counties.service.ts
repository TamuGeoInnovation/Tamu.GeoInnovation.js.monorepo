import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { County, CountyClaim, EntityStatus, TestingSite, Lockdown, State } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountiesService extends BaseService<County> {
  constructor(
    @InjectRepository(County) private repo: Repository<County>,
    @InjectRepository(CountyClaim) private claimRepo: Repository<CountyClaim>
  ) {
    super(repo);
  }

  public search(keyword: string) {
    return this.repo.find({
      where: {
        name: Like(`%${keyword}%`)
      }
    });
  }

  public searchCountiesForState(statefips: number, keyword: string) {
    return this.repo.find({
      where: {
        stateFips: statefips,
        name: Like(`%${keyword}%`)
      }
    });
  }

  public getCountiesForState(stateFips: number | string) {
    if (!stateFips || stateFips === undefined || stateFips === null || stateFips === 'undefined' || stateFips === 'null') {
      throw new Error('Invalid input parameter.');
    }

    return this.repo.find({
      where: {
        stateFips
      }
    });
  }

  public async getCountyStats(): Promise<CountyStats> {
    const counties = await this.getCountiesAndDetails({ claims: true, sites: true, lockdowns: true });

    const categorized = counties.reduce((acc, curr) => {
      const countyString = curr.countyFips.toString().padStart(5, '0');

      const t: CountyStat = (acc[countyString] = {});

      t.claims = curr.claims.length;

      t.sites = curr.claims.reduce((a, c) => {
        return a + c.sites.length;
      }, 0);

      t.lockdowns = curr.claims.reduce((a, c) => {
        return a + c.lockdowns.length;
      }, 0);

      t.lockdownInfo = curr.claims.map((c) => {
        if (c.lockdowns[0] === undefined) {
          return null;
        } else {
          const lockdownStat: LockdownStat = {
            updated: c.lockdowns[0].updated,
            created: c.lockdowns[0].created,
            guid: c.lockdowns[0].guid
          };
          return lockdownStat;
        }
      });

      return acc;
    }, {});

    return categorized;
  }

  public async getSummary() {
    const counties = await this.getCountiesAndDetails({ claims: true, lockdowns: true, state: true });

    // Return only the counties with claims
    return counties.filter((c) => {
      return c.claims && c.claims.length > 0;
    });
  }

  private getCountiesAndDetails(returns?: { claims?: boolean; sites?: boolean; lockdowns?: boolean; state?: boolean }) {
    const counties = this.repo.createQueryBuilder('county');

    if (returns !== undefined) {
      if (returns.claims) {
        counties.leftJoinAndMapMany('county.claims', CountyClaim, 'claim', 'claim.countyFips = county.countyFips');
      }

      if (returns.sites) {
        counties.leftJoinAndMapMany('claim.sites', TestingSite, 'site', 'site.claim = claim.guid');
      }

      if (returns.lockdowns) {
        counties.leftJoinAndMapMany('claim.lockdowns', Lockdown, 'lockdown', 'lockdown.claim = claim.guid');
      }

      if (returns.state) {
        counties.leftJoinAndSelect('county.stateFips', 'state');
      }
    }

    counties.orderBy('county.countyFips', 'ASC');

    return counties.getMany() as Promise<Array<CountyExtended>>;
  }
}

interface ClaimWithData extends CountyClaim {
  sites: TestingSite[];
  lockdowns: Lockdown[];
}

export interface CountyExtended extends County {
  claims: ClaimWithData[];
  statuses: EntityStatus[];
}

export interface LockdownStat {
  updated: Date;
  created: Date;
  guid: string;
}

export interface CountyStat {
  claims?: number;
  sites?: number;
  lockdowns?: number;
  lockdownInfo?: LockdownStat[];
}

export interface CountyStats {
  [key: string]: CountyStat;
}

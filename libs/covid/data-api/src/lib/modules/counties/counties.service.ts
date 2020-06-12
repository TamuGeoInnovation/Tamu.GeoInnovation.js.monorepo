import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { County, CountyClaim, StatusType, EntityStatus, TestingSite, Lockdown } from '@tamu-gisc/covid/common/entities';

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
    const counties = (await this.repo
      .createQueryBuilder('county')
      .leftJoinAndMapMany('county.claims', CountyClaim, 'claim', 'claim.countyFips = county.countyFips')
      .leftJoinAndMapMany('claim.sites', TestingSite, 'site', 'site.claim = claim.guid')
      .leftJoinAndMapMany('claim.lockdowns', Lockdown, 'lockdown', 'lockdown.claim = claim.guid')
      .getMany()) as Array<CountyExtended>;

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

      return acc;
    }, {});

    return categorized;
  }
}

interface ClaimWithData extends CountyClaim {
  sites: TestingSite[];
  lockdowns: Lockdown[];
}
interface CountyExtended extends County {
  claims: ClaimWithData[];
  statuses: EntityStatus[];
}

interface CountyStat {
  claims?: number;
  sites?: number;
  lockdowns?: number;
}

export interface CountyStats {
  [key: string]: CountyStat;
}

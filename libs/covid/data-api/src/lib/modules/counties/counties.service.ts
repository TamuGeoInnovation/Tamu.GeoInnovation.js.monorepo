import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { County, User } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountiesService extends BaseService<County> {
  constructor(
    @InjectRepository(County) private repo: Repository<County>,
    @InjectRepository(User) private userRepo: Repository<User>
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

  public getCountiesForState(stateFips: number) {
    return this.repo.find({
      where: {
        stateFips
      }
    });
  }

  /**
   * Register a county to a user.
   */
  public async associateUserWithCounty(countyFips: number, email: string) {
    const user = await this.userRepo.findOne({ email });

    if (!user) {
      throw new Error('Invalid email.');
    }

    const county = await this.repo.findOne({ where: { countyFips } });

    if (!county) {
      throw new Error('Invalid county fips.');
    }

    user.claimedCounties = [county];

    return user.save();
  }
}

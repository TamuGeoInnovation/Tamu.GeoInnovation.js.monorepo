import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { County } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class CountiesService extends BaseService<County> {
  constructor(@InjectRepository(County) private repo: Repository<County>) {
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
}

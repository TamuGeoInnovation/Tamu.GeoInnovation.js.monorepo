import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';

import { State } from '@tamu-gisc/covid/common/entities';

import { BaseService } from '../base/base.service';

@Injectable()
export class StatesService extends BaseService<State> {
  constructor(@InjectRepository(State) private repo: Repository<State>) {
    super(repo);
  }

  public search(keyword: string) {
    const searchCriteria: any[] = [
      {
        name: Like(`%${keyword}%`)
      },
      {
        abbreviation: Like(`%${keyword}%`)
      }
    ];

    // Only search by stateFips if keyword is numeric
    const numericKeyword = parseInt(keyword, 10);
    if (!isNaN(numericKeyword)) {
      searchCriteria.push({
        stateFips: numericKeyword
      });
    }

    return this.repo.find({
      where: searchCriteria
    });
  }

  public getStateByFips(fips: number) {
    return this.repo.findOne({ where: { stateFips: fips } });
  }
}

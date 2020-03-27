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
    return this.repo.find({
      where: [
        {
          name: Like(`%${keyword}%`)
        },
        {
          abbreviation: Like(`%${keyword}%`)
        }
      ]
    });
  }
}

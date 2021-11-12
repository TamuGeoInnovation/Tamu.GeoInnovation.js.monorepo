import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/common';

import { DeepPartial, Repository } from 'typeorm';

import { BaseService } from '../_base/base.service';

@Injectable()
export class FormService extends BaseService<CompetitionForm> {
  constructor(
    @InjectRepository(CompetitionForm) private formRepo: Repository<CompetitionForm>,
    @InjectRepository(CompetitionSeason) private seasonRepo: Repository<CompetitionSeason>
  ) {
    super(formRepo);
  }

  public getSeason(year: string) {
    return this.seasonRepo.findOne({
      relations: ['form'],
      where: [
        {
          year: year
        },
        {
          guid: year
        }
      ]
    });
  }
}

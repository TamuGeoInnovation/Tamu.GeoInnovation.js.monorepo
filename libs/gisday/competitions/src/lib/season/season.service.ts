import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeepPartial, Repository } from 'typeorm';

import { CompetitionSeason } from '@tamu-gisc/gisday/common';

import { BaseService } from '../_base/base.service';
@Injectable()
export class extends BaseService<CompetitionSeason> {
  constructor(@InjectRepository(CompetitionSeason) private seasonRepo: Repository<CompetitionSeason>) {
    super(seasonRepo);
  }
}

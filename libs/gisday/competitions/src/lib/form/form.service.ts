import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompetitionForm } from '@tamu-gisc/gisday/common';

import { DeepPartial, Repository } from 'typeorm';

import { BaseService } from '../_base/base.service';

@Injectable()
export class FormService extends BaseService<CompetitionForm> {
  constructor(@InjectRepository(CompetitionForm) private formRepo: Repository<CompetitionForm>) {
    super(formRepo);
  }
}

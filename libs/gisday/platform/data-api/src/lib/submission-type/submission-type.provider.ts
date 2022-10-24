import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { SubmissionType } from '../entities/all.entity';
import { BaseProvider } from '../_base/base-provider';

@Injectable()
export class SubmissionTypeProvider extends BaseProvider<SubmissionType> {
  constructor(@InjectRepository(SubmissionType) private submissionTypeRepo: Repository<SubmissionType>) {
    super(submissionTypeRepo);
  }
}

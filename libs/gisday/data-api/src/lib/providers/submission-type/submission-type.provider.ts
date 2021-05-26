import { Injectable } from '@nestjs/common';

import { SubmissionType, SubmissionTypeRepo } from '../../entities/all.entity';
import { BaseProvider } from '../../providers/_base/base-provider';

@Injectable()
export class SubmissionTypeProvider extends BaseProvider<SubmissionType> {
  constructor(private readonly submissionTypeRepo: SubmissionTypeRepo) {
    super(submissionTypeRepo);
  }
}

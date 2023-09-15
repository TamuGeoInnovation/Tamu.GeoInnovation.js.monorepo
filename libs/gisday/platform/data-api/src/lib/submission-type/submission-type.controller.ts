import { Controller } from '@nestjs/common';

import { SubmissionType } from '../entities/all.entity';
import { SubmissionTypeProvider } from './submission-type.provider';
import { BaseController } from '../_base/base.controller';

@Controller('submission-type')
export class SubmissionTypeController extends BaseController<SubmissionType> {
  constructor(private readonly submissionTypeProvider: SubmissionTypeProvider) {
    super(submissionTypeProvider);
  }
}

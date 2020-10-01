import { Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SubmissionType } from '../../entities/all.entity';
import { SubmissionTypeProvider } from '../../providers/submission-type/submission-type.provider';
import { BaseController } from '../../controllers/_base/base.controller';

@Controller('submission-type')
export class SubmissionTypeController extends BaseController<SubmissionType> {
  constructor(private readonly submissionTypeProvider: SubmissionTypeProvider) {
    super(submissionTypeProvider);
  }
}

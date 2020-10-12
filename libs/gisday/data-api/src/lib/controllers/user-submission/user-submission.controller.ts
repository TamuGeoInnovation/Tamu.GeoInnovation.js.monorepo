import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { UserSubmission } from '../../entities/all.entity';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-submission')
export class UserSubmissionController extends BaseController<UserSubmission> {
  constructor(private readonly userSubmissionProvider: UserSubmissionProvider) {
    super(userSubmissionProvider);
  }

  @Post()
  public async insertUserSubmission(@Req() req: Request) {
    return this.userSubmissionProvider.insertUserSubmission(req);
  }
}

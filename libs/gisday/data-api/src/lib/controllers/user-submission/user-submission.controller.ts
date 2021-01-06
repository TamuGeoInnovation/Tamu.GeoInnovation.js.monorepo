import { Controller, Get, Post, Req } from '@nestjs/common';

import { Request } from 'express';

import { UserSubmission } from '../../entities/all.entity';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-submission')
export class UserSubmissionController extends BaseController<UserSubmission> {
  constructor(private readonly userSubmissionProvider: UserSubmissionProvider) {
    super(userSubmissionProvider);
  }

  @Get('all')
  public async getUserSubmissions(@Req() req: Request) {
    if (req.user) {
      return this.userSubmissionProvider.getEntitiesForUser(req.user.sub);
    } else {
      return;
    }
  }

  @Post()
  public async insertUserSubmission(@Req() req: Request) {
    if (req.user) {
      const _userSubmission: Partial<UserSubmission> = req.body;
      return this.userSubmissionProvider.insertUserSubmission(req.user.sub, _userSubmission);
    } else {
      return;
    }
  }
}

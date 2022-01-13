import { Controller, Get, HttpException, HttpStatus, Post, Request } from '@nestjs/common';

import { UserSubmission } from '../../entities/all.entity';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-submission')
export class UserSubmissionController extends BaseController<UserSubmission> {
  constructor(private readonly userSubmissionProvider: UserSubmissionProvider) {
    super(userSubmissionProvider);
  }

  @Get('all')
  public async getUserSubmissions(@Request() req) {
    if (req.user) {
      return this.userSubmissionProvider.getEntitiesForUser(req.user.sub);
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post()
  public async insertUserSubmission(@Request() req) {
    if (req.user) {
      const _userSubmission: Partial<UserSubmission> = req.body;
      return this.userSubmissionProvider.insertUserSubmission(req.user.sub, _userSubmission);
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}

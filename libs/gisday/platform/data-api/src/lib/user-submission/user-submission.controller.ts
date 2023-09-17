import { Controller, Get, Post, Request, UnauthorizedException } from '@nestjs/common';

import { Submission } from '../entities/all.entity';
import { UserSubmissionProvider } from './user-submission.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-submissions')
export class UserSubmissionController extends BaseController<Submission> {
  constructor(private readonly userSubmissionProvider: UserSubmissionProvider) {
    super(userSubmissionProvider);
  }

  @Get('presentations')
  public async getPresentations() {
    return this.userSubmissionProvider.userSubmissionRepo.find({
      where: {
        type: 'Presentation',
        season: '2020'
      }
    });
  }

  @Get('posters')
  public async getPosters() {
    return this.userSubmissionProvider.userSubmissionRepo.find({
      where: {
        type: 'Poster',
        season: '2020'
      }
    });
  }

  @Get()
  public async getUserSubmissions(@Request() req) {
    if (req.user) {
      return this.userSubmissionProvider.find({
        where: {
          accountGuid: req.user.sub
        }
      });
    } else {
      throw new UnauthorizedException();
    }
  }

  @Post()
  public async insertUserSubmission(@Request() req) {
    if (req.user) {
      const _userSubmission: Partial<Submission> = req.body;
      return this.userSubmissionProvider.insertUserSubmission(req.user.sub, _userSubmission);
    } else {
      throw new UnauthorizedException();
    }
  }
}

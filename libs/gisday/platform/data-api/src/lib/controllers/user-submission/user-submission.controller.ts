import { Controller, Get, Post, Request, UnauthorizedException } from '@nestjs/common';

import { Submission } from '../../entities/all.entity';
import { UserSubmissionProvider } from '../../providers/user-submission/user-submission.provider';
import { BaseController } from '../_base/base.controller';

@Controller('user-submission')
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

  @Get('all')
  public async getUserSubmissions(@Request() req) {
    if (req.user) {
      return this.userSubmissionProvider.getEntitiesForUser(req.user.sub);
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

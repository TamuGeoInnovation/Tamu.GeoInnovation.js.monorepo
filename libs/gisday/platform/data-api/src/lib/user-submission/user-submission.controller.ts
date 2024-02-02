import {
  Body,
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';

import { Submission } from '../entities/all.entity';
import { UserSubmissionProvider } from './user-submission.provider';

@Controller('user-submissions')
export class UserSubmissionController {
  constructor(private readonly provider: UserSubmissionProvider) {}

  @Get('presentations')
  public async getPresentations() {
    return this.provider.userSubmissionRepo.find({
      where: {
        type: 'Presentation',
        season: '2020'
      }
    });
  }

  @Get('posters')
  public async getPosters() {
    return this.provider.userSubmissionRepo.find({
      where: {
        type: 'Poster',
        season: '2020'
      }
    });
  }

  @Get(':guid')
  public async getEntity(@Param('guid') guid) {
    return this.provider.findOne({
      where: {
        guid: guid
      }
    });
  }

  @Get()
  public async getUserSubmissions(@Request() req) {
    if (req.user) {
      return this.provider.find({
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
      return this.provider.insertUserSubmission(req.user.sub, _userSubmission);
    } else {
      throw new UnauthorizedException();
    }
  }

  @Patch(':guid')
  public async updateEntity(@Param('guid') guid: string, @Body() body: DeepPartial<Submission>) {
    throw new NotImplementedException();
  }

  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

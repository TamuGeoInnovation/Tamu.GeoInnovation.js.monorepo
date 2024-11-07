import {
  Controller,
  Delete,
  Get,
  NotImplementedException,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { Submission } from '../entities/all.entity';
import { UserSubmissionProvider } from './user-submission.provider';

@Controller('user-submissions')
export class UserSubmissionController {
  constructor(private readonly provider: UserSubmissionProvider) {}

  @UseGuards(JwtGuard)
  @Get('me')
  public async getPresentations(@Request() req) {
    return this.provider.getUserPresentationsForActiveSeason(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Get(':guid')
  public async getEntity(@Param('guid') guid, @Request() req) {
    // TODO: Validate user/admin access to this resource
    return this.provider.getUserPresentation(guid, req.user.sub, req.user.roles);
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Post()
  public async insertUserSubmission(@Request() req) {
    if (req.user) {
      const _userSubmission: Partial<Submission> = req.body;
      return this.provider.insertUserSubmission(req.user.sub, _userSubmission);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtGuard)
  @Patch(':guid')
  public async updateEntity() {
    throw new NotImplementedException();
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Param('guid') guid: string) {
    this.provider.deleteEntity({
      where: {
        guid: guid
      }
    });
  }
}

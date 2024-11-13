import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';

import { JwtGuard, PermissionsGuard, Permissions } from '@tamu-gisc/common/nest/auth';

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
    return this.provider.getUserPresentation(guid, req.user.sub, req.user.permissions);
  }

  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/active')
  public async getSubmissionForActiveSeason() {
    return this.provider.getSubmissionsForActiveSeason();
  }

  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:guid')
  public async getSubmissionsForSeason(@Param('guid') seasonGuid: string) {
    return this.provider.getSubmissionsForSeason(seasonGuid);
  }

  @UseGuards(JwtGuard)
  @Post()
  public async insertUserSubmission(@Request() req, @Body() submission: Partial<Submission>) {
    if (req.user) {
      return this.provider.insertUserSubmission(req.user.sub, submission);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtGuard)
  @Patch(':guid')
  public async updateEntity(@Request() req, @Param('guid') guid, @Body() submission: Partial<Submission>) {
    if (req.user) {
      return this.provider.updateUserSubmission(guid, req.user.sub, submission, req.user.permissions);
    } else {
      throw new UnauthorizedException();
    }
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Req() req, @Param('guid') guid: string) {
    return this.provider.deleteUserSubmission(guid, req.user.sub, req.user.permissions);
  }
}

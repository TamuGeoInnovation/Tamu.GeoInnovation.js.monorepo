import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard, PermissionsGuard, Permissions } from '@tamu-gisc/common/nest/auth';

import { Submission } from '../entities/all.entity';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionFilesService } from './submission-files.service';
import { SUBMISSION_FILE_UPLOAD } from './submission-file-upload';

@Controller('user-submissions')
export class UserSubmissionController {
  constructor(
    private readonly provider: UserSubmissionProvider,
    private readonly files: SubmissionFilesService
  ) {}

  @UseGuards(JwtGuard)
  @Get('me')
  public async getPresentations(@Request() req) {
    return this.provider.getUserPresentationsForActiveSeason(req.user.sub);
  }

  // Public, and declared before ':guid', which would otherwise take 'posters' for a guid and ask for a sign-in.
  @Get('posters')
  public async getPosters(@Query('season', new ParseUUIDPipe({ optional: true })) seasonGuid?: string) {
    return this.provider.getPosters(seasonGuid);
  }

  // Every file of a season's submissions as one zip, for the admins (#2933).
  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:guid/files.zip')
  public getSeasonFiles(@Param('guid', ParseUUIDPipe) seasonGuid: string, @Request() req) {
    return this.files.zipForSeason(seasonGuid, req.user);
  }

  // A submission's attached files (#2933): its owner, or anyone who may read the competitions.
  @UseGuards(JwtGuard)
  @Get(':guid/files')
  public getFiles(@Param('guid', ParseUUIDPipe) guid: string, @Request() req) {
    return this.files.list(guid, req.user);
  }

  @UseGuards(JwtGuard)
  @Get(':guid/files/:file')
  public getFile(@Param('guid', ParseUUIDPipe) guid: string, @Param('file', ParseUUIDPipe) file: string, @Request() req) {
    return this.files.download(guid, file, req.user);
  }

  @UseGuards(JwtGuard)
  @Post(':guid/files')
  @UseInterceptors(FileInterceptor('file', SUBMISSION_FILE_UPLOAD))
  public addFile(@Param('guid', ParseUUIDPipe) guid: string, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.files.add(guid, req.user, file);
  }

  @UseGuards(JwtGuard)
  @Delete(':guid/files/:file')
  public deleteFile(@Param('guid', ParseUUIDPipe) guid: string, @Param('file', ParseUUIDPipe) file: string, @Request() req) {
    return this.files.remove(guid, file, req.user);
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

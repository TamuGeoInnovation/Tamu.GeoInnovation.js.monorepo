import {
  BadRequestException,
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
import { isUUID } from 'class-validator';

import { JwtGuard, PermissionsGuard, Permissions } from '@tamu-gisc/common/nest/auth';

import { Submission } from '../entities/all.entity';
import { UserSubmissionProvider } from './user-submission.provider';
import { siteHost } from '../_base/site-of-request';
import { SubmissionFilesService } from './submission-files.service';
import { EmailSenderService } from '../contact/email-sender.service';
import { SUBMISSION_FILE_UPLOAD } from './submission-file-upload';

@Controller('user-submissions')
export class UserSubmissionController {
  constructor(
    private readonly provider: UserSubmissionProvider,
    private readonly files: SubmissionFilesService,
    private readonly senders: EmailSenderService
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

  /**
   * Every file of a season's submissions as one zip, for the admins (#2933). With `?submissions=<guid>,<guid>`, only those
   * of the season: the rows ticked, or those the filters show (#3174).
   */
  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:guid/files.zip')
  public getSeasonFiles(
    @Param('guid', ParseUUIDPipe) seasonGuid: string,
    @Request() req,
    @Query('submissions') submissions?: string
  ) {
    return this.files.zipForSeason(seasonGuid, req.user, guidList(submissions));
  }

  /**
   * Approves or rejects the named submissions at once, for Research Competitions' selected rows (#2958): each is reviewed
   * and emailed as Submit Review does one, from the reviewer's site, as the sender they chose, checked before anything is
   * decided (#3100). Body: `{ submissions: [guid], acceptance, message?, templates?, sender? }`.
   */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('review')
  public async reviewMany(
    @Body()
    body: {
      submissions: Array<string>;
      acceptance: boolean;
      message?: string;
      templates?: Record<string, string>;
      sender?: string;
    },
    @Request() req
  ) {
    const host = siteHost(req.headers);
    const sender = await this.senders.resolve(req.user, body?.sender, host);

    return this.provider.reviewUserSubmissions(
      body?.submissions,
      req.user.sub,
      // `templates`: the email text the reviewer saw and approved, by kind (#2981).
      { acceptance: body?.acceptance, message: body?.message, templates: body?.templates, sender },
      req.user.permissions,
      host
    );
  }

  /**
   * The email approving or rejecting the named submissions would send, for the reviewer to read and edit first (#2981).
   * Nothing is recorded or sent. Body: `{ submissions: [guid], acceptance, message? }`.
   */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('review/preview')
  public previewReview(@Body() body: { submissions: Array<string>; acceptance: boolean; message?: string }, @Request() req) {
    return this.provider.previewReview(
      body?.submissions,
      { acceptance: body?.acceptance, message: body?.message },
      req.user.permissions,
      siteHost(req.headers)
    );
  }

  /**
   * Sends the final reminder to the named submissions that have no file yet (#3017), in the text the reviewer approved.
   * Body: `{ submissions: [guid], templates?, sender? }`, the sender checked before anything is sent (#3100).
   */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('remind')
  public async remindMany(
    @Body() body: { submissions: Array<string>; templates?: Record<string, string>; sender?: string },
    @Request() req
  ) {
    const host = siteHost(req.headers);
    const sender = await this.senders.resolve(req.user, body?.sender, host);

    return this.provider.remindUserSubmissions(
      body?.submissions,
      { templates: body?.templates, sender },
      req.user.permissions,
      host
    );
  }

  /** The final reminder the named submissions would get, for the reviewer to read and edit first (#3017). */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('remind/preview')
  public previewReminders(@Body() body: { submissions: Array<string> }, @Request() req) {
    return this.provider.previewReminders(body?.submissions, req.user.permissions, siteHost(req.headers));
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
      return this.provider.updateUserSubmission(guid, req.user.sub, submission, req.user.permissions, siteHost(req.headers));
    } else {
      throw new UnauthorizedException();
    }
  }

  /**
   * Deletes the selected submissions, for Research Competitions' Delete (#2992). Body: `{ guid: 'guid,guid' }`, as every
   * admin list sends it. The route was missing, so the list's Delete did nothing.
   */
  @Permissions(['delete:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete()
  public deleteEntities(@Req() req, @Body('guid') guids: string) {
    return this.provider.deleteUserSubmissions(`${guids ?? ''}`.split(','), req.user.sub, req.user.permissions);
  }

  @UseGuards(JwtGuard)
  @Delete(':guid')
  public deleteEntity(@Req() req, @Param('guid') guid: string) {
    return this.provider.deleteUserSubmission(guid, req.user.sub, req.user.permissions);
  }
}

/** A comma-separated list of guids from a query string, every one checked: a malformed one is refused, not ignored. */
export function guidList(text: string | undefined): Array<string> | undefined {
  const guids = (text ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  if (guids.some((g) => !isUUID(g))) {
    throw new BadRequestException('submissions must be a comma-separated list of ids.');
  }

  return guids.length ? guids : undefined;
}

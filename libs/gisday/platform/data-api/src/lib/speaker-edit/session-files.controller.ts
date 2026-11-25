import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SUBMISSION_FILE_UPLOAD } from '../user-submission/submission-file-upload';
import { SessionFilesService } from './session-files.service';
import { SpeakerEditLinkGuard, type SpeakerLinkRequest } from './speaker-edit-link.guard';

/**
 * The slides of the sessions speakers present (#3093). The link routes take no sign-in: the speaker's edit link in the
 * path is the proof, checked by the link's own check before anything else runs, an upload's file included. The rest are
 * the admins', with the permission that lets them edit sessions; nobody else sees the slides.
 */
@Controller('session-files')
export class SessionFilesController {
  constructor(private readonly files: SessionFilesService) {}

  /** The speaker's sessions this season, each with the files that speaker uploaded for it. */
  @UseGuards(SpeakerEditLinkGuard)
  @Get('link/:token')
  public forLink(@Request() req: SpeakerLinkRequest) {
    return this.files.forLink(req.speakerEditLink);
  }

  /**
   * Adds a file to the speaker's own slides for a session, up to three: received as a submission's file is. The session
   * is not checked by a pipe, which runs after the file is written and would leave it behind; the service refuses one
   * that is not the speaker's, or a fourth file, and removes the file.
   */
  @UseGuards(SpeakerEditLinkGuard)
  @Post('link/:token/:event')
  @UseInterceptors(FileInterceptor('file', SUBMISSION_FILE_UPLOAD))
  public upload(
    @Param('event') event: string,
    @Request() req: SpeakerLinkRequest,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.files.upload(req.speakerEditLink, event, file);
  }

  /** Removes one of the speaker's own files; another speaker's reads as not found. */
  @UseGuards(SpeakerEditLinkGuard)
  @Delete('link/:token/:event/:file')
  @HttpCode(204)
  public remove(
    @Param('event', ParseUUIDPipe) event: string,
    @Param('file', ParseUUIDPipe) file: string,
    @Request() req: SpeakerLinkRequest
  ) {
    return this.files.remove(req.speakerEditLink, event, file);
  }

  /** Which of a season's sessions have slides, for the admins' list. */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:guid')
  public forSeason(@Param('guid', ParseUUIDPipe) guid: string) {
    return this.files.forSeason(guid);
  }

  /** Every speaker's files for a session, each labelled with who uploaded it, for its admin page. */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('event/:guid')
  public forEvent(@Param('guid', ParseUUIDPipe) guid: string) {
    return this.files.forEvent(guid);
  }

  /**
   * Every speaker's slides for a session as one zip, a folder per speaker (#3174). Declared before `event/:guid/:file`,
   * which would otherwise take `files.zip` for a file's id and refuse it.
   */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('event/:guid/files.zip')
  public zip(@Param('guid', ParseUUIDPipe) guid: string) {
    return this.files.zipForEvent(guid);
  }

  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('event/:guid/:file')
  public download(@Param('guid', ParseUUIDPipe) guid: string, @Param('file', ParseUUIDPipe) file: string) {
    return this.files.download(guid, file);
  }

  /** Removes any speaker's file from a session, one whose speaker is no longer listed included (#3105). */
  @Permissions(['update:events'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete('event/:guid/:file')
  @HttpCode(204)
  public removeFromEvent(@Param('guid', ParseUUIDPipe) guid: string, @Param('file', ParseUUIDPipe) file: string) {
    return this.files.remove(null, guid, file);
  }
}

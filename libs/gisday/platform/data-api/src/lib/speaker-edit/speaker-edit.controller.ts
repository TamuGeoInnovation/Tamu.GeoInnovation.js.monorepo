import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';
import { DEFAULT_UPLOAD_LIMITS } from '@tamu-gisc/common/nest/services';

import { ProfileEmail, SpeakerEditFields, SpeakerEditService } from './speaker-edit.service';
import { siteHost } from '../_base/site-of-request';
import { EmailSenderService } from '../contact/email-sender.service';

// Where it lived first; kept so its importers need not change.
export { siteHost };

/**
 * Speakers editing their own profile through an emailed link (#2936). The link routes take no sign-in: the token in the
 * path is the proof, and the service looks the speaker up by it. The review routes are the admins', with the permission
 * that already lets them edit speakers.
 */
@Controller('speaker-edits')
export class SpeakerEditController {
  constructor(
    private readonly service: SpeakerEditService,
    private readonly senders: EmailSenderService
  ) {}

  /**
   * Emails each named speaker their own link, in the subject and text the admin approved, if given (#3023), as the
   * sender they chose, checked first (#3100).
   */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('send')
  public async send(@Body() body: { speakers: Array<string>; sender?: string } & Partial<ProfileEmail>, @Request() req) {
    const host = siteHost(req?.headers);
    const sender = await this.senders.resolve(req?.user, body?.sender, host);

    return this.service.sendLinks(body?.speakers, host, emailOf(body), sender);
  }

  /** The email `send` would send, for the admin to read and edit first (#3023). Nothing is sent. */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('send/preview')
  public preview(@Body('speakers') speakers: Array<string>, @Request() req) {
    return this.service.previewLinks(speakers, siteHost(req?.headers));
  }

  /**
   * Emails the people of each named competition submission their own link (#2958), from Research Competitions. It reads
   * the submissions' participants and emails speakers, so it takes both permissions.
   */
  @Permissions(['update:speakers', 'read:competitions'], 'all')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('send-for-submissions')
  public async sendForSubmissions(
    @Body() body: { submissions: Array<string>; sender?: string } & Partial<ProfileEmail>,
    @Request() req
  ) {
    const host = siteHost(req?.headers);
    // The sender they chose, checked before anything is sent (#3100).
    const sender = await this.senders.resolve(req?.user, body?.sender, host);

    return this.service.sendLinksForSubmissions(body?.submissions, host, emailOf(body), sender);
  }

  /** The email `send-for-submissions` would send, for the admin to read and edit first (#3023). Nothing is sent. */
  @Permissions(['update:speakers', 'read:competitions'], 'all')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('send-for-submissions/preview')
  public previewForSubmissions(@Body('submissions') submissions: Array<string>, @Request() req) {
    return this.service.previewLinksForSubmissions(submissions, siteHost(req?.headers));
  }

  /** A speaker asking for their own link. The same answer whoever asks. */
  @Post('request')
  @HttpCode(202)
  public async request(@Body('email') email: string, @Request() req) {
    await this.service.requestLink(email, siteHost(req?.headers));

    return { message: "If that address is a speaker's, a link to edit their profile is on its way." };
  }

  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('pending')
  public pending() {
    return this.service.pending();
  }

  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get(':guid/photo')
  public async photo(@Param('guid', ParseUUIDPipe) guid: string, @Res() res: Response) {
    const photo = await this.service.photo(guid);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(photo);
  }

  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post(':guid/approve')
  public approve(@Param('guid', ParseUUIDPipe) guid: string, @Request() req) {
    return this.service.approve(guid, req.user?.sub);
  }

  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post(':guid/reject')
  public reject(@Param('guid', ParseUUIDPipe) guid: string, @Request() req) {
    return this.service.reject(guid, req.user?.sub);
  }

  /** The edit page: the speaker's profile as it is, and anything they already proposed. */
  @Get('link/:token')
  public forLink(@Param('token') token: string) {
    return this.service.forLink(token);
  }

  /** What the speaker proposes. Multipart, so a photo can come with it. */
  @Post('link/:token')
  @UseInterceptors(FileInterceptor('photo', { limits: { ...DEFAULT_UPLOAD_LIMITS } }))
  public propose(
    @Param('token') token: string,
    @Body() body: SpeakerEditFields,
    @UploadedFile() photo?: Express.Multer.File
  ) {
    return this.service.propose(token, body, photo);
  }
}

/** The edited email in a send's body (#3023), or undefined when the admin sent neither part: the email as it always was. */
function emailOf(body: Partial<ProfileEmail> | undefined): ProfileEmail | undefined {
  return body?.subject === undefined && body?.template === undefined
    ? undefined
    : { subject: body.subject, template: body.template };
}

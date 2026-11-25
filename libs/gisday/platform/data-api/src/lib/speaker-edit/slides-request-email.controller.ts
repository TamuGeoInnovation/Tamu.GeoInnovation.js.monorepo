import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { siteHost } from '../_base/site-of-request';
import { EmailSenderService } from '../contact/email-sender.service';
import { emailOf } from './session-details-email.controller';
import { refuseTogether } from './speaker-edit.controller';
import { SlidesRequestEmail, SlidesRequestEmailService } from './slides-request-email.service';

/**
 * A session's speakers asked for their slides (#3113), from the session's admin page, beside the session details email's
 * routes. Behind the profile email's own permission and guards, as every email to speakers is.
 */
@Controller('session-emails')
export class SlidesRequestEmailController {
  constructor(
    private readonly service: SlidesRequestEmailService,
    private readonly senders: EmailSenderService
  ) {}

  /**
   * Asks the session's speakers for their slides, a copy each with their own link, in the subject and text the admin
   * approved, if given, as the sender they chose, checked first (#3100): the speakers ticked (#3104). Asked to go to them
   * together, it is refused before anything is sent: each copy carries its speaker's own link (decided 1A).
   */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('slides')
  public async send(
    @Body()
    body:
      | ({ event?: string; sender?: string; speakers?: Array<string>; together?: unknown } & Partial<SlidesRequestEmail>)
      | undefined,
    @Request() req
  ) {
    refuseTogether(
      body,
      "The Ask for slides email carries each speaker's own link to upload their slides, so it is sent as a copy each, never together."
    );

    const host = siteHost(req?.headers);
    const sender = await this.senders.resolve(req?.user, body?.sender, host);

    return this.service.send(body?.event, host, emailOf(body), sender, body?.speakers);
  }

  /** The email `slides` would send, prefilled from the session, for the admin to read and edit first. Nothing is sent. */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('slides/preview')
  public preview(@Body('event') event: string, @Request() req) {
    return this.service.preview(event, siteHost(req?.headers));
  }
}

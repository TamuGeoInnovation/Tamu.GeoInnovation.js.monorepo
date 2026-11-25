import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { siteHost } from '../_base/site-of-request';
import { EmailSenderService } from '../contact/email-sender.service';
import { SessionDetailsEmail, SessionDetailsEmailService, SpeakerChoice } from './session-details-email.service';

/**
 * A session's speakers emailed its details (#3092), from the session's admin page. Behind the profile email's own
 * permission and guards, as both email a session's speakers.
 */
@Controller('session-emails')
export class SessionDetailsEmailController {
  constructor(
    private readonly service: SessionDetailsEmailService,
    private readonly senders: EmailSenderService
  ) {}

  /**
   * Emails the session's speakers its details, in the subject and text the admin approved, if given, as the sender they
   * chose, checked first (#3100): the speakers ticked, together or a copy each, as chosen (#3104).
   */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('details')
  public async send(
    @Body() body: ({ event?: string; sender?: string } & Partial<SessionDetailsEmail> & SpeakerChoice) | undefined,
    @Request() req
  ) {
    const host = siteHost(req?.headers);
    const sender = await this.senders.resolve(req?.user, body?.sender, host);

    return this.service.send(body?.event, host, emailOf(body), sender, choiceOf(body));
  }

  /** The email `details` would send, prefilled from the session, for the admin to read and edit first. Nothing is sent. */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('details/preview')
  public preview(@Body('event') event: string, @Request() req) {
    return this.service.preview(event, siteHost(req?.headers));
  }
}

/** The edited email in a send's body, or undefined when the admin sent neither part: the email as prefilled. */
export function emailOf(body: Partial<SessionDetailsEmail> | undefined): SessionDetailsEmail | undefined {
  return body?.subject === undefined && body?.template === undefined
    ? undefined
    : // A part not sent is empty, which the service refuses with the same reason as it refused the part missing.
      { subject: body.subject ?? '', template: body.template ?? '' };
}

/** Who was ticked, and whether together (#3104), or undefined when the send names neither: everyone, a copy each. */
function choiceOf(body: SpeakerChoice | undefined): SpeakerChoice | undefined {
  return body?.speakers === undefined && body?.together === undefined
    ? undefined
    : {
        ...(body.speakers === undefined ? {} : { speakers: body.speakers }),
        ...(body.together === undefined ? {} : { together: body.together === true })
      };
}

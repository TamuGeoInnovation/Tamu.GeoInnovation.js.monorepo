import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { siteHost } from '../_base/site-of-request';
import { SessionDetailsEmail, SessionDetailsEmailService } from './session-details-email.service';

/**
 * A session's speakers emailed its details (#3092), from the session's admin page. Behind the profile email's own
 * permission and guards, as both email a session's speakers.
 */
@Controller('session-emails')
export class SessionDetailsEmailController {
  constructor(private readonly service: SessionDetailsEmailService) {}

  /** Emails each of the session's speakers its details, in the subject and text the admin approved, if given. */
  @Permissions(['update:speakers'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('details')
  public send(@Body() body: { event: string } & Partial<SessionDetailsEmail>, @Request() req) {
    // Who sent it is recorded with the send (#3098).
    return this.service.send(body?.event, siteHost(req?.headers), emailOf(body), req?.user?.sub);
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
function emailOf(body: Partial<SessionDetailsEmail> | undefined): SessionDetailsEmail | undefined {
  return body?.subject === undefined && body?.template === undefined
    ? undefined
    : { subject: body.subject, template: body.template };
}

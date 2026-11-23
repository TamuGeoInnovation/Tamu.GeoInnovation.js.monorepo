import { Controller, Get, Request, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { siteHost } from '../_base/site-of-request';
import { EmailSenderService } from './email-sender.service';

/**
 * The addresses the signed-in admin may send the composer's emails as (#3100), for its "Send as" box. Guarded as the
 * send routes are: each of them takes one of these two permissions.
 */
@Controller('email-senders')
export class EmailSenderController {
  constructor(private readonly senders: EmailSenderService) {}

  @Permissions(['update:speakers', 'update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get()
  public choices(@Request() req) {
    return this.senders.choices(req?.user, siteHost(req?.headers));
  }
}

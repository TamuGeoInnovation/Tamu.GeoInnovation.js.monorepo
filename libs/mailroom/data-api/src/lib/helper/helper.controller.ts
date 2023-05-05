import { Body, Controller, Post } from '@nestjs/common';
import got from 'got';

import { MailroomOutbound } from '@tamu-gisc/mailroom/common';

@Controller('mail')
export class HelperController {
  @Post('')
  public forwardMail(@Body() body: MailroomOutbound) {
    return got.post({
      url: `${process.env.MAILROOM_URL}/form`,
      json: body
    });
  }
}

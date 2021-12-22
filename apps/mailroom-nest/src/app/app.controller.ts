import { Body, Controller, Get, Post } from '@nestjs/common';
import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post()
  sendEmail(@Body() body) {
    // console.log("Got something to send out", body)
    // const outbound: IMailroomEmailOutbound = {
    //   subjectLine: body.subjectLine,
    //   emailBodyText: body.emailBodyText,
    //   recipientEmail: body.recipientEmail
    // }
    return Mailer.sendEmail(body);
  }
}


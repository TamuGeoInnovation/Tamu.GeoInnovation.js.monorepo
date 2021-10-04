import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { IMailroomEmailOutbound } from '@tamu-gisc/mailroom/common';

import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  public getData() {
    return this.appService.getData();
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  public sendEmail(@UploadedFiles() files: Array<File>, @Body() body) {
    // console.log('Body', body);
    // console.log('FormData', files);
    const outbound: IMailroomEmailOutbound = {
      ...body,
      subjectLine: body.subjectLine,
      emailBodyText: body.emailBodyText,
      recipientEmail: body.recipientEmail
    };
    return Mailer.sendEmail(outbound, true);
    // return;
  }
}

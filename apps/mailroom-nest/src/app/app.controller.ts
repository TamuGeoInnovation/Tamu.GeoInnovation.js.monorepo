import { Body, Controller, Get, Post, UploadedFiles, UseFilters, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import {
  HasRecipientInterceptor,
  IMailroomEmailOutbound,
  LogToDatabaseInterceptor,
  MailroomExceptionFilter
} from '@tamu-gisc/mailroom/common';
import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  public getData() {
    return this.service.getData();
  }

  @Post()
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(LogToDatabaseInterceptor)
  public async sendEmailTest(@Body() body: IMailroomEmailOutbound) {
    return Mailer.sendEmail(body);
  }

  @Post('attachments')
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(AnyFilesInterceptor(), HasRecipientInterceptor)
  public async sendEmailTest2(@UploadedFiles() files: Array<Express.Multer.File>, @Body() body: IMailroomEmailOutbound) {
    return Mailer.sendEmailWithAttachments(body, files);
  }
}

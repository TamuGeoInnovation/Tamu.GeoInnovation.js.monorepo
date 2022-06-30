import { Body, Controller, Get, Post, UploadedFiles, UseFilters, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import 'multer';

import { IMailroomEmailOutbound, LogToDatabaseInterceptor, MailroomExceptionFilter } from '@tamu-gisc/mailroom/common';
import { Mailer } from '@tamu-gisc/oidc/common';

@Controller()
export class AppController {
  @Get()
  public isRunning() {
    return 200;
  }

  @Post()
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(LogToDatabaseInterceptor)
  public async sendEmail(@Body() body: IMailroomEmailOutbound) {
    return Mailer.sendEmail(body);
  }

  @Post('attachments')
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(AnyFilesInterceptor(), LogToDatabaseInterceptor)
  public async sendEmailWithAttachments(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: IMailroomEmailOutbound
  ) {
    return Mailer.sendEmailWithAttachments(body, files);
  }
}

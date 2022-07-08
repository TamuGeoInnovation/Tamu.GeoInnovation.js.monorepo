import { Body, Controller, Delete, Get, Param, Post, UploadedFiles, UseFilters, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import 'multer';

import { IMailroomEmailOutbound, LogToDatabaseInterceptor, MailroomExceptionFilter } from '@tamu-gisc/mailroom/common';
import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(public readonly service: AppService) {}

  @Get()
  public isRunning() {
    return 200;
  }

  @Get('all')
  public getAllEmails() {
    return this.service.getAllEmails();
  }

  @Get(':id')
  public getEmail(@Param('id') id) {
    return this.service.getEmail(id);
  }

  @Delete(':id')
  public deleteEmail(@Param('id') id) {
    return this.service.deleteEmail(id);
  }

  @Post()
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(LogToDatabaseInterceptor)
  public async sendEmail(@Body() body: IMailroomEmailOutbound) {
    return Mailer.sendEmail(body);
  }

  @Post('form')
  @UseFilters(MailroomExceptionFilter)
  @UseInterceptors(AnyFilesInterceptor(), LogToDatabaseInterceptor)
  public async sendEmailFromFormWithAttachments(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: IMailroomEmailOutbound
  ) {
    return Mailer.sendEmailWithAttachments(body, files);
  }
}

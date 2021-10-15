import { Body, Controller, Get, Post, UploadedFiles, UseFilters, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import {
  HasRecipientInterceptor,
  IMailroomEmailOutbound,
  LogToDatabaseInterceptor,
  NoRecipientFilter
} from '@tamu-gisc/mailroom/common';
import { Mailer } from '@tamu-gisc/oidc/common';

import { AppService } from './app.service';

import { OutboundPipe } from '@tamu-gisc/mailroom/common';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @Get()
  public getData() {
    return this.service.getData();
  }

  @Post()
  @UseFilters(NoRecipientFilter)
  @UseInterceptors(AnyFilesInterceptor(), HasRecipientInterceptor, LogToDatabaseInterceptor)
  public sendEmail(@UploadedFiles() files: Array<File>, @Body(OutboundPipe) body) {
    if (body.recipientEmail && files) {
      return Mailer.sendEmailWithAttachments(body, files, false);
    } else if (body.recipientEmail) {
      return Mailer.sendEmail(body, true);
    } else {
      return new Error('No recipient email provided');
    }
  }

  @Post('test')
  @UseFilters(NoRecipientFilter)
  @UseInterceptors(AnyFilesInterceptor(), HasRecipientInterceptor)
  public async sendEmailTest(@UploadedFiles() files: Array<Express.Multer.File>, @Body(OutboundPipe) body) {
    return await this.service.insertMailroomEmail(body);
  }
}

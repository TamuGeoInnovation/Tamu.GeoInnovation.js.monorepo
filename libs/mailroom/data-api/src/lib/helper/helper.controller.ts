import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import * as FormData from 'form-data';
import got from 'got';

@Controller('mail')
export class HelperController {
  @Post('')
  @UseInterceptors(AnyFilesInterceptor())
  public async forwardMail(
    @Body() body: { [key: string]: string | Blob },
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    const form = new FormData();

    // Repackage body as form data
    Object.keys(body).forEach((key) => {
      form.append(key, body[key]);
    });

    // Repackage files as form data
    files.forEach((file) => {
      form.append('attachments', file.buffer, file.originalname);
    });

    return got(`${process.env.MAILROOM_API_URL}`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    }).json();
  }
}

import { Body, Controller, HttpException, HttpStatus, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';

import * as FormData from 'form-data';
import got from 'got';

@Controller('mail')
export class HelperController {
  constructor(private readonly env: EnvironmentService) {}

  @Post('')
  @UseInterceptors(AnyFilesInterceptor())
  public async forwardMail(
    @Body() body: { [key: string]: string | Blob },
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res
  ) {
    const form = new FormData();

    const ignoreKeys = ['replyTo', 'to', 'from'];

    // Repackage body as form data
    Object.keys(body)
      .filter((key) => {
        return !ignoreKeys.includes(key);
      })
      .forEach((key) => {
        form.append(key, body[key]);
      });

    // Since this module is used either as a standalone microservice or imported into another,
    // some variables are fixed and known.
    form.append('replyTo', body['from']);
    form.append('to', this.env.value('mailroomToAddress'));
    form.append('from', this.env.value('mailroomFromAddress'));

    // Repackage files as form data
    files.forEach((file) => {
      form.append('attachments', file.buffer, file.originalname);
    });

    const reject = this.env.value('rejectUnauthorized');

    const status = await got(`${this.env.value('mailroomUrl')}/form`, {
      method: 'POST',
      https: {
        rejectUnauthorized: reject
      },
      body: form,
      headers: form.getHeaders()
    });

    const parsed = JSON.parse(status.body);

    if (
      (!parsed.exception && status.statusCode.toString().startsWith('2')) ||
      status.statusCode.toString().startsWith('3')
    ) {
      return res.status(200).json({
        statusCode: HttpStatus.OK,
        message: 'Successfully forwarded email.'
      });
    } else {
      throw new HttpException(parsed.exception, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

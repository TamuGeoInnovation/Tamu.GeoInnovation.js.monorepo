import { Body, Controller, HttpException, HttpStatus, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import * as FormData from 'form-data';
import got from 'got';

@Controller('mail')
export class HelperController {
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
    form.append('to', process.env.MAILROOM_TO);
    form.append('from', process.env.MAILROOM_FROM);

    // Repackage files as form data
    files.forEach((file) => {
      form.append('attachments', file.buffer, file.originalname);
    });

    const reject = process.env.REJECT_UNAUTHORIZED === undefined ? true : process.env.REJECT_UNAUTHORIZED == '1';

    const status = await got(`${process.env.MAILROOM_URL}`, {
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

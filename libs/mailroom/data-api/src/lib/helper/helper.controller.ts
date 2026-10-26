import {
  Body,
  Controller,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { EnvironmentService } from '@tamu-gisc/common/nest/environment';
import { DEFAULT_UPLOAD_LIMITS, isMailroomTimeout, mailroomRequestOptions } from '@tamu-gisc/common/nest/services';
import { MAIL_CONTENT_FIELDS } from '@tamu-gisc/mailroom/common';

import got from 'got';

@Controller('mail')
export class HelperController {
  constructor(private readonly env: EnvironmentService) {}

  @Post('')
  // Forwarded messages may have several attachments; each is capped at 5 MiB (50 MiB total).
  @UseInterceptors(AnyFilesInterceptor({ limits: { ...DEFAULT_UPLOAD_LIMITS, files: 10, parts: 60 } }))
  public async forwardMail(
    @Body() body: { [key: string]: string | Blob },
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Res() res
  ) {
    // The platform's FormData: got 12 and later send no other kind, and set the multipart headers themselves (#1218).
    const form = new FormData();

    // Forward only the message content. The addresses are fixed below, and anything else (raw,
    // envelope, headers, ...) is dropped rather than passed to mailroom (#2121).
    MAIL_CONTENT_FIELDS.filter((key) => typeof body[key] === 'string').forEach((key) => {
      form.append(key, body[key] as string);
    });

    // Since this module is used either as a standalone microservice or imported into another,
    // some variables are fixed and known.
    form.append('replyTo', body['from']);
    form.append('to', this.env.value('mailroomToAddress'));
    form.append('from', this.env.value('mailroomFromAddress'));

    // Repackage files as form data
    files.forEach((file) => {
      // Copied into a plain Uint8Array: a Buffer's memory may be shared, which a Blob does not take.
      form.append('attachments', new Blob([new Uint8Array(file.buffer)]), file.originalname);
    });

    const reject = this.env.value('rejectUnauthorized');

    // Every answer reaches the checks below (throwHttpErrors: false), so a mailroom error becomes this controller's
    // HttpException rather than the HTTP client's own error; a mailroom that never answers becomes a 504 (#2277).
    const status = await got(`${this.env.value('mailroomUrl')}/form`, {
      method: 'POST',
      https: {
        rejectUnauthorized: reject
      },
      body: form,
      throwHttpErrors: false,
      ...mailroomRequestOptions()
    }).catch((e) => {
      if (isMailroomTimeout(e)) {
        throw new GatewayTimeoutException('Mailroom did not answer in time.');
      }

      throw e;
    });

    // An error page need not be JSON.
    let parsed: { exception?: string };

    try {
      parsed = JSON.parse(status.body);
    } catch {
      parsed = { exception: `Mailroom answered ${status.statusCode} with no readable reason.` };
    }

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

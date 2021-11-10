import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { CompetitionSubmission, SubmissionMedia } from '@tamu-gisc/gisday/common';
import { DeepPartial } from 'typeorm';

import { BaseController } from '../_base/base.controller';
import { SubmissionService } from './submission.service';
@Controller('submission')
export class SubmissionController extends BaseController<CompetitionSubmission> {
  constructor(private service: SubmissionService) {
    super(service);
  }

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  public insert(@Body() body, @UploadedFiles() files?: Array<Express.Multer.File>) {
    const sub: DeepPartial<CompetitionSubmission> = {
      value: JSON.stringify(body.value),
      userGuid: body.userGuid,
      location: JSON.parse(body.location)
    };

    if (files) {
      const entityFiles = files.map((file) => {
        const _file: DeepPartial<SubmissionMedia> = {
          blob: Buffer.from(file.buffer),
          mimeType: file.mimetype
        };

        return _file;
      });

      return this.service.createCompetitionSubmission(sub, entityFiles);
    } else {
      return this.service.createOne(sub);
    }
  }
}

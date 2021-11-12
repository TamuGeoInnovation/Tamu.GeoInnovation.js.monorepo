import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { CompetitionSubmission, SubmissionMedia } from '@tamu-gisc/gisday/common';
import { DeepPartial } from 'typeorm';
import { FormService } from '../form/form.service';

import { BaseController } from '../_base/base.controller';
import { SubmissionService } from './submission.service';
@Controller('submission')
export class SubmissionController extends BaseController<CompetitionSubmission> {
  constructor(private service: SubmissionService, private formService: FormService) {
    super(service);
  }

  @Get()
  public getAll() {
    // TODO: Aaron H
    // Fails if you're calling a relation that doesn't exist for a single entry
    // i.e. if there is no media and you include 'blobs' relation it's gonna break
    return this.service.getMany({
      relations: ['location'] // ['location', 'blobs', 'season']
    });
  }

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  public async insert(@Body() body, @UploadedFiles() files?: Array<Express.Multer.File>) {
    const season = await this.formService.getSeason(body.season);

    const sub: DeepPartial<CompetitionSubmission> = {
      value: JSON.parse(body.value),
      userGuid: body.userGuid,
      location: JSON.parse(body.location),
      season: season
    };

    if (files) {
      const entityFiles = files.map((file) => {
        const _file: DeepPartial<SubmissionMedia> = {
          blob: Buffer.from(file.buffer),
          mimeType: file.mimetype,
          fieldName: file.fieldname
        };

        return _file;
      });

      return this.service.createCompetitionSubmission(sub, entityFiles);
    } else {
      return this.service.createOne(sub);
    }
  }
}

import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { DeepPartial } from 'typeorm';
import { Duplex } from 'stream';

import { CompetitionSubmission, SubmissionMedia } from '@tamu-gisc/gisday/common';

import { FormService } from '../form/form.service';
import { BaseController } from '../_base/base.controller';
import { SubmissionService } from './submission.service';

@Controller('submission')
export class SubmissionController extends BaseController<CompetitionSubmission> {
  constructor(private service: SubmissionService, private formService: FormService) {
    super(service);
  }

  @Get(':guid/image')
  public async getSubmission(@Param() param, @Res() res) {
    const submission = await this.service.getOne({
      where: {
        guid: param.guid
      },
      relations: ['location', 'season', 'blobs']
    });

    function bufferToStream(myBuuffer) {
      const tmp = new Duplex();
      tmp.push(myBuuffer);
      tmp.push(null);
      return tmp;
    }

    const myReadableStream = bufferToStream(submission.blobs[0].blob);

    myReadableStream.pipe(res);
  }

  @Get()
  public getAll() {
    return this.service.getMany({
      relations: ['location', 'season', 'season.form']
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

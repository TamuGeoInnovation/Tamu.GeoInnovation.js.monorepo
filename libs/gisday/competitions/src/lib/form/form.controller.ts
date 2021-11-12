import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { DeepPartial } from 'typeorm';

import { CompetitionForm, CompetitionSubmission, SubmissionMedia } from '@tamu-gisc/gisday/common';

import { BaseController } from '../_base/base.controller';
import { FormService } from './form.service';

@Controller('form')
export class FormController extends BaseController<CompetitionForm> {
  constructor(private service: FormService) {
    super(service);
  }

  @Get(':year')
  public getForm(@Param() params) {
    return this.service.getSeason(params.year);
  }

  @Post(':year')
  public async insertForm(@Body() body, @Param() params) {
    const _form: DeepPartial<CompetitionForm> = {
      source: body.source,
      model: body.model
    };

    const form = this.service.repository.create(_form);

    const season = await this.service.getSeason(params.year);

    season.form = form;

    await season.save();

    return season;
  }
}

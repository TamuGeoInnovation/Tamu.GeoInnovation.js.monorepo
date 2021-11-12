import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { DeepPartial } from 'typeorm';

import { CompetitionSeason } from '@tamu-gisc/gisday/common';

import { BaseController } from '../_base/base.controller';
import { SeasonService } from './season.service';

@Controller('season')
export class SeasonController extends BaseController<CompetitionSeason> {
  constructor(private service: SeasonService) {
    super(service);
  }
}

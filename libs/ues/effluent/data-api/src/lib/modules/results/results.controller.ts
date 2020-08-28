import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Result } from '@tamu-gisc/ues/effluent/common/entities';

import { BaseController } from '../base/base.controller';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController extends BaseController<Result> {
  constructor(private service: ResultsService) {
    super(service);
  }

  @Post('csv')
  @UseInterceptors(FileInterceptor('file', { dest: '../files' }))
  public handleFileUpload(@UploadedFile() file) {
    if (file) {
      this.service.handleFileUpload(file.filename);
    } else {
      throw new HttpException('Input parameter missing', HttpStatus.BAD_REQUEST);
    }
  }
}

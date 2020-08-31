import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus, Get, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Result } from '@tamu-gisc/ues/effluent/common/entities';

import { BaseController } from '../base/base.controller';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController extends BaseController<Result> {
  constructor(private service: ResultsService) {
    super(service);
  }

  @Get()
  public getAllResults() {
    return this.service.getResults({ options: { groupByDate: true } });
  }

  @Get('latest')
  public getLatestValue() {
    return this.service.getLatestNValuesForTierSample(undefined, undefined, 1);
  }

  @Get('latest/average')
  public getLatestAverage() {
    return this.service.getLatestNValueAverageForTierSample(undefined, undefined, 1);
  }

  @Get('latest/:days')
  public getLatestValues(@Param() params: { days: string }) {
    return this.service.getLatestNValuesForTierSample(undefined, undefined, params.days);
  }

  @Get(':tier')
  public getResultsForTier(@Param() params) {
    return this.service.getResults({
      limiters: {
        tier: params.tier
      }
    });
  }

  @Post('csv')
  @UseInterceptors(FileInterceptor('file', { dest: '../files' }))
  public handleFileUpload(@UploadedFile() file) {
    if (file) {
      return this.service.handleFileUpload(file.filename);
    } else {
      throw new HttpException('Input parameter missing', HttpStatus.BAD_REQUEST);
    }
  }
}

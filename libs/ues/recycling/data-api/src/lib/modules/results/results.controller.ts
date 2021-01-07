import { Controller, Get, HttpException, HttpStatus, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Result } from '@tamu-gisc/ues/recycling/common/entities';

import { BaseController } from '../base/base.controller';
import { ResultsService } from './results.service';

@Controller('results')
export class ResultsController extends BaseController<Result> {
  constructor(private service: ResultsService) {
    super(service);
  }

  // @UseGuards(AzureIdpGuard)
  @Get()
  public getAllResults() {
    return this.service.getResults({ options: { groupByDate: true } });
  }

  // @UseGuards(AzureIdpGuard)
  @Get('latest/:id/:days')
  public getLatestForLocationForDays(@Param() params: { id: string; days: string }) {
    return this.service.getLatestNValuesForLocation(params.id, params.days);
  }

  // @UseGuards(AzureIdpGuard)
  @Get('latest/:id')
  public getLatestForLocation(@Param() params: { id: string }) {
    return this.service.getLatestNValuesForLocation(params.id, undefined);
  }

  // @UseGuards(AzureIdpGuard)
  @Get('latest/average')
  public getLatestAverage() {
    return this.service.getLatestNValueAverageForLocation(undefined, 1);
  }

  // @UseGuards(AzureIdpGuard)
  @Get('latest')
  public getLatestValue() {
    return this.service.getLatestNValuesForLocation(undefined, 1);
  }

  // @UseGuards(AzureIdpGuard)
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

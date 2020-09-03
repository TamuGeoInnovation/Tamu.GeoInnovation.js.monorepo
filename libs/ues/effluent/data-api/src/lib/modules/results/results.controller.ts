import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Get,
  Param,
  UseGuards
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Result } from '@tamu-gisc/ues/effluent/common/entities';
import { AdminRoleGuard, LoginGuard, AzureIdpGuard } from '@tamu-gisc/oidc/client';

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

  @Get('latest/:tier/:sample')
  public getLatestForTierSample(@Param() params: { tier: string; sample: string }) {
    return this.service.getLatestNValuesForTierSample(params.tier, params.sample);
  }

  @Get('latest/average')
  public getLatestAverage() {
    return this.service.getLatestNValueAverageForTierSample(undefined, undefined, 1);
  }

  @Get('latest/:days')
  public getLatestValues(@Param() params: { days: string }) {
    return this.service.getLatestNValuesForTierSample(undefined, undefined, params.days);
  }

  @UseGuards(AzureIdpGuard)
  @Get('latest')
  public getLatestValue() {
    return this.service.getLatestNValuesForTierSample(undefined, undefined, 1);
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

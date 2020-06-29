import { Controller, Delete, Patch, Param, Post, Get, HttpException, HttpStatus } from '@nestjs/common';

import { County } from '@tamu-gisc/covid/common/entities';

import { BaseController } from '../base/base.controller';
import { CountiesService } from './counties.service';

@Controller('counties')
export class CountiesController extends BaseController<County> {
  constructor(private service: CountiesService) {
    super(service);
  }

  @Get('stats')
  public async getCountyStats() {
    try {
      const counties = await this.service.getCountyStats();
      return counties;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get('summary')
  public async getCountySummary() {
    try {
      const summary = await this.service.getSummary();

      return summary;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Could not get county summary, ${err.message}`,
          success: false
        },
        500
      );
    }
  }

  @Get('state/:fips/:keyword')
  public searchCountiesForState(@Param() params) {
    return this.service.searchCountiesForState(params.fips, params.keyword);
  }

  @Get('state/:fips')
  public async getCountiesForState(@Param() params) {
    try {
      const counties = await this.service.getCountiesForState(params.fips);
      return counties;
    } catch (err) {
      return {
        status: 500,
        success: false,
        message: err.message
      };
    }
  }

  @Get(':keyword')
  public searchState(@Param() params) {
    return this.service.search(params.keyword);
  }

  @Post('')
  public insertState() {
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        success: false,
        message: 'Not implemented'
      },
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  @Patch(':id')
  public updateState() {
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        success: false,
        message: 'Not implemented'
      },
      HttpStatus.NOT_IMPLEMENTED
    );
  }

  @Delete(':id')
  public deleteState() {
    throw new HttpException(
      {
        status: HttpStatus.NOT_IMPLEMENTED,
        success: false,
        message: 'Not implemented'
      },
      HttpStatus.NOT_IMPLEMENTED
    );
  }
}

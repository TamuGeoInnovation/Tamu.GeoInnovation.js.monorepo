import { Controller, Delete, Patch, Param, Post, Body, Get } from '@nestjs/common';

import { County } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';
import { BaseController } from '../base/base.controller';

@Controller('counties')
export class CountiesController extends BaseController<County> {
  constructor(private service: CountiesService) {
    super(service);
  }

  @Get('state/:fips/:keyword')
  public searchCountiesForState(@Param() params) {
    return this.service.searchCountiesForState(params.fips, params.keyword);
  }

  @Get('state/:fips')
  public getCountiesForState(@Param() params) {
    return this.service.getCountiesForState(params.fips);
  }

  @Get(':keyword')
  public searchState(@Param() params) {
    return this.service.search(params.keyword);
  }

  @Post('')
  public insertState() {
    return 'Not implemented.';
  }

  @Patch(':id')
  public updateState() {
    return 'Not implemented.';
  }

  @Delete(':id')
  public deleteState() {
    return 'Not implemented.';
  }
}

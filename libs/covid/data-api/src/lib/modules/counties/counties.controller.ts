import { Controller, Delete, Patch, Param, Post, Body, Get } from '@nestjs/common';

import { County } from '@tamu-gisc/covid/common/entities';

import { CountiesService } from './counties.service';
import { BaseController } from '../base/base.controller';

@Controller('counties')
export class CountiesController extends BaseController<County> {
  constructor(private service: CountiesService) {
    super(service);
  }

  @Get(':keyword')
  public searchState(@Param() params) {
    return this.service.search(params.keyword);
  }

  @Post('')
  public insertState(@Body() body) {
    return 'Not implemented.';
  }

  @Patch(':id')
  public updateState(@Param() body) {
    return 'Not implemented.';
  }

  @Delete(':id')
  public deleteState(@Param() body) {
    return 'Not implemented.';
  }
}

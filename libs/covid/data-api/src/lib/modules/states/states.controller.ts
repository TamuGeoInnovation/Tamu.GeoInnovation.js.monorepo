import { Controller, Post, Body, Patch, Param, Delete, Get } from '@nestjs/common';

import { State } from '@tamu-gisc/covid/common/entities';

import { StatesService } from './states.service';
import { BaseController } from '../base/base.controller';

@Controller('states')
export class StatesController extends BaseController<State> {
  constructor(private service: StatesService) {
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

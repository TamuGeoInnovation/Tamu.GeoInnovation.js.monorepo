import { Controller, Post, Patch, Param, Delete, Get } from '@nestjs/common';

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

  @Get('/f/:fips')
  public getState(@Param() params) {
    return this.service.getStateByFips(params.fips);
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

import { Controller, Get, Param } from '@nestjs/common';

import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // The listing, create, update and delete routes were never built and only answered 501; they were removed (#3896).
  @Get(':guid')
  public getAsset(@Param('guid') guid: string) {
    return this.assetsService.findOne(guid);
  }
}

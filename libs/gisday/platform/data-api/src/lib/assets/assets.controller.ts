import { Controller, Get, Post, Patch, Param, Delete, NotImplementedException, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get(':guid')
  public getAsset(@Param('guid') guid: string) {
    return this.assetsService.findOne(guid);
  }

  @Get()
  public getAssets() {
    return new NotImplementedException();
  }

  @Permissions(['create:assets'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post()
  public createAsset() {
    return new NotImplementedException();
  }

  @Permissions(['update:assets'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Patch(':guid')
  public updateAsset() {
    return new NotImplementedException();
  }

  @Permissions(['delete:assets'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Delete(':guid')
  public deleteAsset() {
    return new NotImplementedException();
  }
}

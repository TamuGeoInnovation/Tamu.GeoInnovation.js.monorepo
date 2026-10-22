import { Body, Controller, Get, Param, ParseBoolPipe, Post, Query, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SiteCopyFile } from './site-copy.format';
import { SiteCopyService } from './site-copy.service';

/**
 * Copying a season from one GIS Day site to another (#2078). An admin exports a file on one site and
 * imports it on another, which shows what it would add and update before anything is written.
 */
@Controller('site-copy')
export class SiteCopyController {
  constructor(private readonly service: SiteCopyService) {}

  /** `source` is the site's own address, which the importing site fetches logos and photos from. */
  @Permissions(['update:seasons', 'update:events', 'update:speakers'], 'all')
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('export/:seasonGuid')
  public export(@Param('seasonGuid') seasonGuid: string, @Query('source') source: string) {
    return this.service.export(seasonGuid, source);
  }

  /** Without `apply=true` it only compares, and writes nothing. */
  @Permissions(
    [
      'create:seasons',
      'create:season-days',
      'create:places',
      'create:organizations',
      'create:universities',
      'create:event-locations',
      'create:event-broadcasts',
      'create:tags',
      'create:speakers',
      'create:events',
      'create:assets'
    ],
    'all'
  )
  @UseGuards(JwtGuard, PermissionsGuard)
  @Post('import')
  public import(@Body() file: SiteCopyFile, @Query('apply', new ParseBoolPipe({ optional: true })) apply = false) {
    return this.service.import(file, apply);
  }
}

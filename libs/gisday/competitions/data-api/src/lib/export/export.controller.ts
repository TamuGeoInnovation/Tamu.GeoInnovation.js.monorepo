import { Controller, Get, Query, StreamableFile, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { ExportService } from './export.service';

@Controller('competitions/export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  /**
   * The season's VGI submissions as one zip, streamed now (#545): the admin Submissions page's download. The active
   * season unless `seasonGuid` names another. The queued export's three routes, which nothing called, went with `bull`
   * (#3788).
   */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('zip')
  async zipForSeason(@Query('seasonGuid') seasonGuid?: string): Promise<StreamableFile> {
    return this.exportService.zipForSeason(seasonGuid);
  }
}

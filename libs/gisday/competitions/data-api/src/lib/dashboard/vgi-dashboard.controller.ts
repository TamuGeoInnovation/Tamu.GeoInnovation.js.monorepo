import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { READ_ALL_SUBMISSIONS } from '../submission/submission.controller';
import { VgiDashboardProvider } from './vgi-dashboard.provider';

/**
 * The VGI submissions dashboard (#2894), behind the permission that reads every participant's submissions. Its own
 * controller under the submissions' address, so `dashboard` is never read as a submission's guid.
 */
@Controller('competitions/submissions/dashboard')
export class VgiDashboardController {
  constructor(private readonly dashboard: VgiDashboardProvider) {}

  /** A season's submissions by feature type: counts only, no names. `:guid` is the GIS Day season. */
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions([READ_ALL_SUBMISSIONS])
  @Get('season/:guid')
  public getSeason(@Param('guid') guid: string) {
    return this.dashboard.getSeason(guid);
  }

  /** Who submitted one feature type in a season, with their counts, for an opened row and its CSV. */
  @UseGuards(JwtGuard, PermissionsGuard)
  @Permissions([READ_ALL_SUBMISSIONS])
  @Get('season/:guid/type/:type')
  public getType(@Param('guid') guid: string, @Param('type') type: string) {
    return this.dashboard.getType(guid, type);
  }
}

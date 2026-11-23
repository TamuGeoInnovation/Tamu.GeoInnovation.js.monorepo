import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { TrailWinnersProvider } from './trail-winners.provider';

/**
 * The trail challenge's winners (#3243), for the Winners page: read by whoever may see the competitions, picked by
 * whoever may review them, as the research competitions' winners are. The homepage reads them with those (#3239).
 */
@Controller('competitions/trail-winners')
export class TrailWinnersController {
  constructor(private readonly trail: TrailWinnersProvider) {}

  /** The season's submitters, ranked, with names and points, and the places picked. `:season` is the GIS Day season. */
  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:season')
  public forSeason(@Param('season') season: string) {
    return this.trail.forSeason(season);
  }

  /** Every trail place of the season: `{ winners: [{ place, account }] }`. */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Put('season/:season')
  public save(@Param('season') season: string, @Body() body: { winners?: unknown }) {
    return this.trail.save(season, body);
  }
}

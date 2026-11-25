import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { JwtGuard, Permissions, PermissionsGuard } from '@tamu-gisc/common/nest/auth';

import { SeasonWinnerService } from './season-winner.service';

/**
 * A season's winners (#3239): the homepage reads them, signed in or not; the admins who may see the competitions read the
 * Winners page, and those who may review them pick the places.
 */
@Controller('season-winners')
export class SeasonWinnerController {
  constructor(private readonly winners: SeasonWinnerService) {}

  /** The active season's winners once its GIS Day is over, else nothing: place, names and title only. */
  @Get()
  public shown() {
    return this.winners.shown();
  }

  @Permissions(['read:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Get('season/:season')
  public forSeason(@Param('season') season: string) {
    return this.winners.forSeason(season);
  }

  /** Every judged place of the season: `{ winners: [{ competition, place, submission }] }`. */
  @Permissions(['update:competitions'])
  @UseGuards(JwtGuard, PermissionsGuard)
  @Put('season/:season')
  public save(@Param('season') season: string, @Body() body: { winners?: unknown }) {
    return this.winners.save(season, body);
  }
}

import { Injectable } from '@nestjs/common';

import { TrailWinnersAdminDto } from '@tamu-gisc/gisday/common';
import { DashboardProfilesService, SeasonWinnerService, profileName } from '@tamu-gisc/gisday/platform/data-api';

import { LeaderboardService } from '../leaderboard/leaderboard.service';

/**
 * The trail challenge's winners on the Winners page (#3243): the season's submitters in the leaderboard's order, with the
 * points it gives them and their names from their profiles, as the dashboards read them; and their places, kept by
 * account beside the research competitions' (#3239). Here rather than with the winners because the leaderboard is the
 * competitions' own.
 */
@Injectable()
export class TrailWinnersProvider {
  constructor(
    private readonly leaderboard: LeaderboardService,
    private readonly winners: SeasonWinnerService,
    private readonly people: DashboardProfilesService
  ) {}

  public async forSeason(seasonGuid: string): Promise<TrailWinnersAdminDto> {
    const ranked = await this.leaderboard.rankedForSeason(seasonGuid);
    const profiles = await this.people.profilesOf(ranked.map((r) => r.account));

    return {
      entries: ranked.map(({ account, points }) => ({ account, name: profileName(profiles.get(account)), points })),
      winners: await this.winners.trailPlaces(seasonGuid)
    };
  }

  public async save(seasonGuid: string, body: { winners?: unknown }): Promise<TrailWinnersAdminDto> {
    const ranked = await this.leaderboard.rankedForSeason(seasonGuid);

    await this.winners.saveTrail(seasonGuid, body, new Set(ranked.map((r) => r.account)));

    return this.forSeason(seasonGuid);
  }
}

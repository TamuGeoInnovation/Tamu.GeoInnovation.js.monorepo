import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { LessThan, Repository } from 'typeorm';

import { ManagementService } from '@tamu-gisc/common/nest/auth';

import { Season } from '../entities/all.entity';
import { DashboardProfilesService, PROFILE_KEPT_MS } from '../dashboards/dashboard-profiles.service';
import { personOf, RsvpDashboardPerson } from '../user-rsvp/dto/rsvp-dashboard.dto';
import { AccountDashboard, accountRowKey, accountRows, seasonWindow } from './dto/account-dashboard.dto';

/** An account has a GIS Day profile once its owner completes My Details, which writes `app_metadata.gisday`. */
export const HAS_GISDAY_PROFILE = '_exists_:app_metadata.gisday';

interface SeasonAccounts {
  at: number;
  dashboard: AccountDashboard;
  people: Array<RsvpDashboardPerson>;
}

/**
 * The admin User accounts dashboard (#2892). Accounts live only in Auth0, which has no season, so a season's accounts
 * are those made in its window (seasonWindow), read from Auth0 by when they were made, in slices that each match fewer
 * than the 1,000 a search pages through (ManagementService.getUsersCreatedBetween). A season, once read, is kept for a
 * few minutes, so opening a row reads nothing again.
 */
@Injectable()
export class AccountDashboardProvider {
  private readonly seasons = new Map<string, SeasonAccounts>();

  constructor(
    @InjectRepository(Season) private readonly seasonRepo: Repository<Season>,
    private readonly people: DashboardProfilesService,
    private readonly ms: ManagementService
  ) {}

  /** The season's accounts, counted by university or employer and by person type, with when each was made. */
  public async getSeason(seasonGuid: string): Promise<AccountDashboard> {
    return (await this.read(seasonGuid)).dashboard;
  }

  /** The people of one row, oldest account first. */
  public async getRow(seasonGuid: string, key: string): Promise<Array<RsvpDashboardPerson>> {
    const { people } = await this.read(seasonGuid);

    return people.filter((p) => accountRowKey(p.organization) === key);
  }

  private async read(seasonGuid: string): Promise<SeasonAccounts> {
    const kept = this.seasons.get(seasonGuid);

    if (kept && Date.now() - kept.at < PROFILE_KEPT_MS) {
      return kept;
    }

    const season = await this.seasonRepo.findOne({ where: { guid: seasonGuid }, relations: { days: true } });

    if (!season) {
      throw new NotFoundException('Season could not be found');
    }

    // The season before this one: the latest year before it.
    const previous = await this.seasonRepo.findOne({
      where: { year: LessThan(season.year) },
      order: { year: 'DESC' },
      relations: { days: true }
    });

    const window = seasonWindow(
      (season.days ?? []).map((d) => d.date),
      (previous?.days ?? []).map((d) => d.date)
    );
    const from = window.from ?? new Date(0);

    const [accounts, allAccounts, organizations] = await Promise.all([
      this.ms.getUsersCreatedBetween(from, window.to, HAS_GISDAY_PROFILE, {
        app_metadata: 'gisday',
        user_metadata: ['occupation', 'education']
      }),
      this.ms.countUsersCreatedBetween(from, window.to),
      this.people.organizationNames()
    ]);

    const people = accounts.map((a) => personOf(a.profile, a.created, organizations));
    const read: SeasonAccounts = {
      at: Date.now(),
      people,
      dashboard: {
        window: { from: window.from?.toISOString() ?? null, to: window.to.toISOString() },
        accounts: people.length,
        allAccounts,
        rows: accountRows(people),
        made: people.map((p) => p.created)
      }
    };

    this.seasons.set(seasonGuid, read);

    return read;
  }
}

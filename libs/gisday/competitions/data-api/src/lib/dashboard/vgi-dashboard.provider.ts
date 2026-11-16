import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';
import { DashboardProfilesService, personOf } from '@tamu-gisc/gisday/platform/data-api';

import { CompetitionSeason, CompetitionSubmission } from '../entities/all.entities';
import { LeaderboardService, NEW_FIND_POINTS } from '../leaderboard/leaderboard.service';
import { VgiDashboard, VgiDashboardCounts, VgiDashboardType, VgiSubmitter } from './vgi-dashboard.dto';

/** The row of submissions with no feature type chosen, or one the form no longer offers. */
export const NO_TYPE = 'none';

/**
 * The VGI submissions dashboard (#2894): a season's submissions by the feature type chosen on its form, with how many
 * the leaderboard scores as new finds and as repeats, the people who made them and their review status; and one type's
 * submitters with their counts. Scored by `LeaderboardService.scoreSubmissions`, the leaderboard's own scoring.
 */
@Injectable()
export class VgiDashboardProvider {
  constructor(
    @InjectRepository(CompetitionSeason) private readonly compSeasonRepo: Repository<CompetitionSeason>,
    private readonly leaderboard: LeaderboardService,
    private readonly people: DashboardProfilesService
  ) {}

  /** Every feature type on the season's form, each with its counts, and when each submission was made. */
  public async getSeason(seasonGuid: string): Promise<VgiDashboard> {
    const read = await this.scored(seasonGuid);

    if (!read) {
      return { season: seasonGuid, people: 0, events: [], made: [], unreadAccounts: 0 };
    }

    const { types, scored, typeOf } = read;
    const rows = new Map<string, VgiDashboardType>(
      types.map((t) => [t.key, { guid: t.key, name: t.name, starts: null, total: 0, counts: emptyCounts() }])
    );
    const peopleOf = new Map<string, Set<string>>();

    for (const { submission, points } of scored) {
      const key = typeOf(submission);
      let row = rows.get(key);

      if (!row) {
        row = { guid: NO_TYPE, name: 'No type chosen', starts: null, total: 0, counts: emptyCounts() };
        rows.set(NO_TYPE, row);
      }

      const people = peopleOf.get(key) ?? new Set<string>();

      people.add(submission.userGuid);
      peopleOf.set(key, people);
      row.total++;
      row.counts.people = people.size;
      row.counts[statusOf(submission)]++;

      if (points === NEW_FIND_POINTS) {
        row.counts.newFinds++;
      } else if (points !== null) {
        row.counts.repeats++;
      }
    }

    return {
      season: seasonGuid,
      people: new Set(scored.map((s) => s.submission.userGuid)).size,
      events: [...rows.values()],
      made: scored.map(({ submission }) => ({
        event: typeOf(submission),
        created: new Date(submission.created).toISOString()
      })),
      // Names are read only when a row is opened.
      unreadAccounts: 0
    };
  }

  /** The people who submitted one feature type, in the order of their first submission of it, with their counts. */
  public async getType(seasonGuid: string, type: string): Promise<Array<VgiSubmitter>> {
    const read = await this.scored(seasonGuid);

    if (!read) {
      return [];
    }

    const byPerson = new Map<string, { first: Date; counts: VgiSubmitter['counts'] }>();

    for (const { submission, points } of read.scored.filter((s) => read.typeOf(s.submission) === type)) {
      const person = byPerson.get(submission.userGuid) ?? {
        first: submission.created,
        counts: { submissions: 0, newFinds: 0, repeats: 0 }
      };

      person.counts.submissions++;
      person.counts.newFinds += points === NEW_FIND_POINTS ? 1 : 0;
      person.counts.repeats += points !== null && points !== NEW_FIND_POINTS ? 1 : 0;
      byPerson.set(submission.userGuid, person);
    }

    const profiles = await this.people.profilesOf([...byPerson.keys()]);
    const organizations = await this.people.organizationNames();

    return [...byPerson.entries()].map(([account, { first, counts }]) => ({
      ...personOf(profiles.get(account), first, organizations),
      counts
    }));
  }

  /**
   * The season's submissions scored, the feature types its form offers, and which type a submission is. Null when the
   * season has no competition.
   */
  private async scored(seasonGuid: string) {
    const competitionSeason = await this.compSeasonRepo.findOne({
      where: { season: { guid: seasonGuid } },
      relations: { form: true, season: true }
    });

    if (!competitionSeason) {
      return null;
    }

    const typeQuestion = competitionSeason.form?.model?.find((q) => q.isDiscriminator === true);
    const types = (typeQuestion?.options ?? []).map((option) => ({ key: String(option.value), name: option.name }));
    const known = new Set(types.map((t) => t.key));
    const typeOf = (submission: CompetitionSubmission) => {
      const value = typeQuestion ? submission.value?.[typeQuestion.attribute] : undefined;

      return value !== undefined && value !== null && known.has(String(value)) ? String(value) : NO_TYPE;
    };

    return { types, scored: await this.leaderboard.scoreSubmissions(competitionSeason), typeOf };
  }
}

function emptyCounts(): VgiDashboardCounts {
  return { newFinds: 0, repeats: 0, people: 0, unverified: 0, verified: 0, discarded: 0 };
}

function statusOf(submission: CompetitionSubmission): 'unverified' | 'verified' | 'discarded' {
  const status = submission.validationStatus?.status;

  return status === COMPETITION_VALIDATION_STATUS.verified || status === COMPETITION_VALIDATION_STATUS.discarded
    ? status
    : 'unverified';
}

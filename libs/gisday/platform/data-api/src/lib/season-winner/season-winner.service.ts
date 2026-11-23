import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  JUDGED_COMPETITIONS,
  SeasonWinnersAdminDto,
  SeasonWinnersDto,
  WINNER_COMPETITIONS,
  WinnerChoice,
  judgedCompetitionOf,
  winnerChoicesProblem,
  winnersShown
} from '@tamu-gisc/gisday/common';

import { Season, SeasonWinner, Submission } from '../entities/all.entity';
import { presentersOf } from '../judging/judging.service';

/** Refused when a place names a submission that is not one of its competition's accepted entries that season. */
export const NOT_AN_ENTRY_MESSAGE = "A winner must be one of the competition's accepted submissions this season.";

const JUDGED: Array<string> = JUDGED_COMPETITIONS.map((row) => row.competition);

/**
 * A season's winners (#3239): the homepage's read, which anyone may make, and the admins' Winners page, which picks 1st,
 * 2nd and 3rd of each judged competition from the season's accepted submissions. The names and titles shown are read from
 * the submissions each time, so nothing is copied, and nothing else about a submission or its people leaves here.
 */
@Injectable()
export class SeasonWinnerService {
  constructor(
    @InjectRepository(SeasonWinner) private readonly winners: Repository<SeasonWinner>,
    @InjectRepository(Season) private readonly seasons: Repository<Season>,
    @InjectRepository(Submission) private readonly submissions: Repository<Submission>
  ) {}

  /**
   * The active season's winners, for the homepage, once its GIS Day is over (`winnersShown`); null before then, or when
   * none have been picked. Each place gives only its place, its people's names and its title. A trail challenge place,
   * kept by account, is not shown until it has a way to be named.
   */
  public async shown(now: Date = new Date()): Promise<SeasonWinnersDto | null> {
    const season = await this.seasons.findOne({ where: { active: true }, relations: { days: true } });

    if (!season || !winnersShown(season.days, now)) {
      return null;
    }

    const rows = await this.winners.find({ where: { season: { guid: season.guid } }, relations: { submission: true } });
    const competitions = WINNER_COMPETITIONS.map(({ competition, label }) => ({
      competition,
      label,
      winners: rows
        .filter((row) => row.competition === competition && row.submission)
        .sort((a, b) => a.place - b.place)
        .map((row) => ({ place: row.place, names: presentersOf(row.submission), title: row.submission.title ?? null }))
    })).filter((c) => c.winners.length > 0);

    return competitions.length ? { year: season.year, competitions } : null;
  }

  /** A season's judged competitions, each with its accepted entries by title, and the places picked, for the admins. */
  public async forSeason(seasonGuid: string): Promise<SeasonWinnersAdminDto> {
    const accepted = await this.submissions.find({ where: { season: { guid: seasonGuid }, acceptance: true } });
    const rows = await this.winners.find({
      where: { season: { guid: seasonGuid }, competition: In(JUDGED) },
      relations: { submission: true }
    });

    return {
      competitions: JUDGED_COMPETITIONS.map(({ competition, label }) => ({
        competition,
        label,
        entries: accepted
          .filter((s) => judgedCompetitionOf(s) === competition)
          .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'en', { sensitivity: 'base' }))
          .map((s) => ({ guid: s.guid, title: s.title ?? null, names: presentersOf(s) }))
      })),
      winners: rows
        .map((row) => ({ competition: row.competition, place: row.place, submission: row.submission?.guid ?? null }))
        .sort((a, b) => JUDGED.indexOf(a.competition) - JUDGED.indexOf(b.competition) || a.place - b.place)
    };
  }

  /**
   * Replaces the season's judged places with those sent: a place not sent, or sent with no submission, is left empty.
   * The trail challenge's places are left as they are. All or nothing.
   */
  public async save(seasonGuid: string, body: { winners?: unknown } | null | undefined): Promise<SeasonWinnersAdminDto> {
    const choices = body?.winners;
    const problem = winnerChoicesProblem(choices);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const season = await this.seasons.findOne({ where: { guid: seasonGuid } });

    if (!season) {
      throw new NotFoundException('No such season.');
    }

    const picked = (choices as Array<WinnerChoice>).filter((c) => c.submission);
    const { competitions } = await this.forSeason(seasonGuid);
    const entryOf = (c: WinnerChoice) =>
      competitions.find((row) => row.competition === c.competition)?.entries.some((e) => e.guid === c.submission);

    if (!picked.every(entryOf)) {
      throw new BadRequestException(NOT_AN_ENTRY_MESSAGE);
    }

    await this.winners.manager.transaction(async (manager) => {
      const table = manager.getRepository(SeasonWinner);
      const old = await table.find({ where: { season: { guid: seasonGuid }, competition: In(JUDGED) } });

      if (old.length) {
        await table.delete(old.map((row) => row.guid));
      }

      await table.save(
        picked.map((c) =>
          table.create({
            season: { guid: seasonGuid },
            competition: c.competition,
            place: c.place,
            submission: { guid: c.submission }
          })
        )
      );
    });

    return this.forSeason(seasonGuid);
  }
}

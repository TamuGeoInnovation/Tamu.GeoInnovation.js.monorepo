import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  JUDGED_COMPETITIONS,
  JUDGING_CLOSED_MESSAGE,
  JudgeAssessmentDto,
  JudgeCompetitionDto,
  JudgePageDto,
  JudgedCompetition,
  JudgingResultsDto,
  NOT_YOUR_COMPETITION_MESSAGE,
  assessmentProblem,
  assessmentTotal,
  isJudgedCompetition,
  judgedCompetition,
  judgedCompetitionOf,
  judgingResults
} from '@tamu-gisc/gisday/common';

import { Assessment, Event, Rubric, Speaker, SpeakerEditLink, Submission } from '../entities/all.entity';
import { fullName } from '../speaker-edit/speaker-edit.service';
import { RubricService } from './rubric.service';

/** What a judge sends for one submission: a score per criterion, by the criterion's id, and a comment. */
export interface AssessmentBody {
  scores?: unknown;
  comment?: unknown;
}

/**
 * The names of a submission's people, as a judge, the results and the homepage's winners (#3239) see them: never their
 * addresses.
 */
export function presentersOf(submission: Submission): Array<string> {
  return (submission.participants ?? []).map((p) => p?.name?.trim()).filter((name): name is string => Boolean(name));
}

/**
 * Judging the research competitions (#3183): what a judge's link opens and saves, and the admins' results.
 *
 * A judge scores every accepted submission of each competition a session they judge is marked with (decided 1A), against
 * the season's rubric for its type, until the admins close judging for that session (4A). They see only their own scores
 * (5A); a judging link is looked up by its token, never by an id from the browser, so it reaches one judge and nothing
 * else, and nothing it returns carries anyone's address.
 */
@Injectable()
export class JudgingService {
  constructor(
    @InjectRepository(Event) private readonly events: Repository<Event>,
    @InjectRepository(Submission) private readonly submissions: Repository<Submission>,
    @InjectRepository(Assessment) private readonly assessments: Repository<Assessment>,
    @InjectRepository(Speaker) private readonly speakers: Repository<Speaker>,
    private readonly rubrics: RubricService
  ) {}

  /** What a judge's link opens: their name, and each competition they judge with its rubric and their scores. */
  public async forJudge(link: SpeakerEditLink): Promise<JudgePageDto> {
    const judge = await this.speakers.findOne({ where: { guid: link.speaker.guid } });
    const groups = await this.competitionsOf(link.speaker.guid);
    const competitions: Array<JudgeCompetitionDto> = [];

    for (const group of groups) {
      const row = judgedCompetition(group.competition);
      const rubric = await this.rubrics.rubricFor(group.season, row.type);
      const submissions = await this.acceptedSubmissions(group.season, group.competition);
      const mine = submissions.length
        ? await this.assessments.find({
            where: { judge: { guid: link.speaker.guid }, submission: { guid: In(submissions.map((s) => s.guid)) } },
            relations: { submission: true }
          })
        : [];

      competitions.push({
        competition: group.competition,
        label: row.label,
        sessions: group.sessions.map((s) => ({ guid: s.guid, name: s.name ?? '' })),
        closed: group.sessions.every((s) => s.judgingClosed),
        rubric,
        submissions: submissions.map((s) => {
          const assessment = mine.find((a) => a.submission?.guid === s.guid);

          return {
            guid: s.guid,
            title: s.title ?? '',
            presenters: presentersOf(s),
            abstract: s.abstract ?? null,
            format: s.format ?? null,
            assessment: assessment ? assessmentDto(assessment) : null
          };
        })
      });
    }

    return {
      firstName: judge?.firstName ?? '',
      lastName: judge?.lastName ?? '',
      expires: new Date(link.expires).toISOString(),
      competitions
    };
  }

  /**
   * Saves a judge's scores for one submission, replacing any they saved before. Refused unless the submission is accepted
   * and in a competition a session they judge is marked with, judging for it is still open, and every criterion of the
   * rubric has a whole-number score within its points. The total is worked out here, never taken from the browser.
   */
  public async assess(link: SpeakerEditLink, submissionGuid: string, body: AssessmentBody): Promise<JudgeAssessmentDto> {
    const judgeGuid = link.speaker.guid;
    const submission =
      typeof submissionGuid === 'string'
        ? await this.submissions.findOne({ where: { guid: submissionGuid }, relations: { season: true } })
        : null;
    const competition = submission?.acceptance ? judgedCompetitionOf(submission) : null;
    const sessions = competition
      ? (await this.judgeSessions(judgeGuid)).filter(
          (s) => s.judgedCompetition === competition && s.season?.guid === submission.season?.guid
        )
      : [];

    if (!submission || sessions.length === 0) {
      throw new ForbiddenException(NOT_YOUR_COMPETITION_MESSAGE);
    }

    const open = sessions.find((s) => !s.judgingClosed);

    if (!open) {
      throw new ForbiddenException(JUDGING_CLOSED_MESSAGE);
    }

    const rubric = await this.rubrics.rubricFor(submission.season.guid, submission.submissionType);

    if (!rubric) {
      throw new BadRequestException('There is no rubric for this competition yet. Ask the GIS Day team.');
    }

    const problem = assessmentProblem(rubric.criteria, body?.scores, body?.comment);

    if (problem) {
      throw new BadRequestException(problem);
    }

    const scores = body.scores as Record<string, number>;
    const comment = typeof body.comment === 'string' && body.comment.trim() ? body.comment.trim() : null;
    const existing = await this.assessments.findOne({
      where: { judge: { guid: judgeGuid }, submission: { guid: submission.guid } }
    });
    const saved = await this.assessments.save(
      this.assessments.create({
        ...(existing ? { guid: existing.guid, created: existing.created } : {}),
        judge: { guid: judgeGuid } as Speaker,
        submission: { guid: submission.guid } as Submission,
        eventGuid: open.guid,
        rubric: { guid: rubric.guid } as Rubric,
        // Only the rubric's criteria, in its order.
        scores: Object.fromEntries(rubric.criteria.map((c) => [c.guid, scores[c.guid]])),
        total: assessmentTotal(rubric.criteria, scores),
        comment
      })
    );

    return assessmentDto({ ...saved, updated: saved.updated ?? new Date() } as Assessment);
  }

  /**
   * A competition's results in a season, for the admins (decided 5A, 6A): a row per accepted submission with each judge's
   * total, how many judged it, the average total and each criterion's average, and each judge's progress.
   */
  public async results(seasonGuid: string, competition: string): Promise<JudgingResultsDto> {
    if (!isJudgedCompetition(competition)) {
      throw new BadRequestException(`${competition} is not a competition a session can judge.`);
    }

    if (typeof seasonGuid !== 'string' || !seasonGuid) {
      throw new BadRequestException('Name the season.');
    }

    const row = judgedCompetition(competition);
    const sessions = await this.events.find({
      where: { season: { guid: seasonGuid }, judgedCompetition: competition },
      relations: { judges: true }
    });
    const rubric = await this.rubrics.rubricFor(seasonGuid, row.type);
    const submissions = await this.acceptedSubmissions(seasonGuid, competition);
    const assessments = submissions.length
      ? await this.assessments.find({
          where: { submission: { guid: In(submissions.map((s) => s.guid)) } },
          relations: { judge: true, submission: true }
        })
      : [];
    const judges = new Map<string, string>();

    for (const judge of [...sessions.flatMap((s) => s.judges ?? []), ...assessments.map((a) => a.judge)]) {
      if (judge && !judges.has(judge.guid)) {
        judges.set(judge.guid, fullName(judge));
      }
    }

    return judgingResults({
      competition,
      rubricName: rubric?.name ?? null,
      criteria: (rubric?.criteria ?? []).map((c) => ({ guid: c.guid, name: c.name, maxPoints: c.maxPoints })),
      submissions: submissions.map((s) => ({ guid: s.guid, title: s.title ?? '', presenters: presentersOf(s) })),
      judges: [...judges].map(([guid, name]) => ({ guid, name })).sort((a, b) => a.name.localeCompare(b.name)),
      assessments: assessments.map((a) => ({
        judge: a.judge?.guid,
        submission: a.submission?.guid,
        scores: a.scores ?? {},
        total: a.total,
        // For the admins' breakdown of an entry (#3193); this route is theirs alone.
        comment: a.comment ?? null
      }))
    });
  }

  /** The sessions a speaker judges that are marked with a competition. */
  private async judgeSessions(judgeGuid: string): Promise<Array<Event>> {
    const sessions = await this.events.find({ where: { judges: { guid: judgeGuid } }, relations: { season: true } });

    return sessions.filter((s) => isJudgedCompetition(s.judgedCompetition));
  }

  /** The competitions a judge judges, each with its season and the judge's sessions marked with it, in the form's order. */
  private async competitionsOf(
    judgeGuid: string
  ): Promise<Array<{ season: string; competition: JudgedCompetition; sessions: Array<Event> }>> {
    const groups = new Map<string, { season: string; competition: JudgedCompetition; sessions: Array<Event> }>();

    for (const session of await this.judgeSessions(judgeGuid)) {
      const season = session.season?.guid;

      if (!season) {
        continue;
      }

      const key = `${season}:${session.judgedCompetition}`;
      const group = groups.get(key) ?? {
        season,
        competition: session.judgedCompetition as JudgedCompetition,
        sessions: []
      };

      group.sessions.push(session);
      groups.set(key, group);
    }

    const order = (c: string) => JUDGED_COMPETITIONS.findIndex((row) => row.competition === c);

    return [...groups.values()].sort((a, b) => order(a.competition) - order(b.competition));
  }

  /** A season's accepted submissions of a competition, by title. */
  private async acceptedSubmissions(seasonGuid: string, competition: JudgedCompetition): Promise<Array<Submission>> {
    const row = judgedCompetition(competition);

    if (!row) {
      throw new NotFoundException();
    }

    const found = await this.submissions.find({
      where: {
        season: { guid: seasonGuid },
        acceptance: true,
        classificationType: row.classification,
        submissionType: row.type
      }
    });

    return found.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', 'en', { sensitivity: 'base' }));
  }
}

/** A judge's scores as their page shows them. */
function assessmentDto(a: Assessment): JudgeAssessmentDto {
  return {
    scores: a.scores ?? {},
    total: a.total,
    comment: a.comment ?? null,
    updated: new Date(a.updated ?? Date.now()).toISOString()
  };
}

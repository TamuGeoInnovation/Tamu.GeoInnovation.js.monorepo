import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { JudgeAssessmentDto, JudgePageDto, JudgingResultsDto, RubricDto, RubricValue } from '@tamu-gisc/gisday/common';

/** A session's judging, as its admin form reads it (#3183). */
export interface EventJudging {
  judgedCompetition: string | null;
  judgingClosed: boolean;
  /** The judges, by speaker id. */
  judges: Array<string>;
}

/** What a judge saves for one submission: a score per criterion, by the criterion's id, and a comment. */
export interface AssessmentScores {
  scores: Record<string, number>;
  comment?: string | null;
}

/**
 * Judging the research competitions (#3183): the judge's link pages, which need no sign-in, and the admins' rubrics,
 * results and a session's judges. The Ask to judge email is sent with the other speaker emails, by `SpeakerEditsService`.
 */
@Injectable({ providedIn: 'root' })
export class JudgingService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(EnvironmentService).value('api_url');

  /** What a judge's link opens: each competition they judge, with its rubric, submissions and their own scores. */
  public forLink(token: string) {
    return this.http.get<JudgePageDto>(`${this.api}/judging/link/${encodeURIComponent(token)}`);
  }

  /** Saves a judge's scores for one submission, until judging closes. */
  public assess(token: string, submissionGuid: string, assessment: AssessmentScores) {
    return this.http.put<JudgeAssessmentDto>(
      `${this.api}/judging/link/${encodeURIComponent(token)}/${submissionGuid}`,
      assessment
    );
  }

  /** A season's rubrics, posters first. */
  public rubrics(seasonGuid: string) {
    return this.http.get<Array<RubricDto>>(`${this.api}/rubrics/season/${seasonGuid}`);
  }

  /** A new rubric for a season: the standard one, as the admin page starts it, or edited. */
  public createRubric(seasonGuid: string, rubric: RubricValue) {
    return this.http.post<RubricDto>(`${this.api}/rubrics`, { ...rubric, season: seasonGuid });
  }

  /** A rubric's name, description and criteria, which replace those it had. */
  public updateRubric(guid: string, rubric: Omit<RubricValue, 'competitionType'>) {
    return this.http.put<RubricDto>(`${this.api}/rubrics/${guid}`, rubric);
  }

  /** A competition's results in a season. */
  public results(seasonGuid: string, competition: string) {
    return this.http.get<JudgingResultsDto>(`${this.api}/judging/results`, {
      params: new HttpParams().set('season', seasonGuid).set('competition', competition)
    });
  }

  /** A session's judged competition, whether judging is closed, and its judges, for its admin form. */
  public eventJudging(eventGuid: string) {
    return this.http.get<EventJudging>(`${this.api}/events/${eventGuid}/judging`);
  }
}

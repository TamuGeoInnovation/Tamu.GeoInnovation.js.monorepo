import {
  EMAIL_KIND_LABELS,
  JUDGED_COMPETITIONS,
  JUDGING_COPY_EACH,
  JUDGING_EMAIL_KIND,
  JUDGING_EMAIL_PLACEHOLDERS,
  JUDGING_LINK_PREVIEW,
  assessmentProblem,
  assessmentTotal,
  fillProfileEmail,
  isJudgedCompetition,
  judgedCompetition,
  judgedCompetitionOf,
  judgedCompetitionProblem,
  judgingEmailProblem,
  judgingEmailSubject,
  judgingEmailTemplate,
  judgingEmailValues,
  judgingResults,
  judgingResultsTable,
  everyScoreTable,
  judgeBreakdown,
  judgingEmailDesign,
  sessionEmailDesign,
  scoredLine
} from '../index';

/** #3183: judging the research competitions. */
describe('Judging the research competitions (#3183)', () => {
  describe('the competitions a session can judge', () => {
    it('are the four, each a classification and a type of submission', () => {
      expect(JUDGED_COMPETITIONS.map((c) => c.competition)).toEqual([
        'graduate-poster',
        'undergraduate-poster',
        'graduate-presentation',
        'undergraduate-presentation'
      ]);
      expect(judgedCompetition('undergraduate-presentation')).toEqual(
        expect.objectContaining({ classification: 'undergraduate', type: 'presentation' })
      );
    });

    it("finds a submission's competition from its classification and type", () => {
      expect(judgedCompetitionOf({ classificationType: 'graduate', submissionType: 'poster' })).toBe('graduate-poster');
      expect(judgedCompetitionOf({ classificationType: 'graduate', submissionType: 'paper' })).toBeNull();
    });

    it('takes none, or one of the four, and nothing else', () => {
      expect(isJudgedCompetition('graduate-poster')).toBe(true);
      expect(judgedCompetitionProblem(null)).toBeNull();
      expect(judgedCompetitionProblem('')).toBeNull();
      expect(judgedCompetitionProblem('graduate-poster')).toBeNull();
      expect(judgedCompetitionProblem('graduate-paper')).toMatch(/not a competition/);
    });
  });

  describe("a judge's scores", () => {
    const criteria = [
      { guid: 'c-1', name: 'Clarity', maxPoints: 20 },
      { guid: 'c-2', name: 'Design', maxPoints: 10 }
    ];

    it('are a whole number from 0 to its points for every criterion', () => {
      expect(assessmentProblem(criteria, { 'c-1': 20, 'c-2': 0 })).toBeNull();
      expect(assessmentTotal(criteria, { 'c-1': 20, 'c-2': 7 })).toBe(27);
    });

    it.each([21, -1, 2.5, '5', null])('refuse %s for a criterion', (score) => {
      expect(assessmentProblem(criteria, { 'c-1': score, 'c-2': 5 })).toMatch(/Clarity/);
    });

    it('refuse a missing criterion, and one not on the rubric', () => {
      expect(assessmentProblem(criteria, { 'c-1': 5 })).toBe('Give a score for Design.');
      expect(assessmentProblem(criteria, { 'c-1': 5, 'c-2': 5, 'c-9': 1 })).toMatch(/not on the rubric/);
      expect(assessmentProblem(criteria, [5, 5])).toMatch(/each criterion/);
    });

    it('refuse a comment that is too long', () => {
      expect(assessmentProblem(criteria, { 'c-1': 5, 'c-2': 5 }, 'x'.repeat(4001))).toMatch(/comment/);
      expect(assessmentProblem(criteria, { 'c-1': 5, 'c-2': 5 }, 'Clear and careful.')).toBeNull();
    });

    it('are counted on the page as scored of the whole', () => {
      expect(scoredLine({ submissions: [{ assessment: {} }, { assessment: null }, { assessment: null }] as never })).toBe(
        '1 of 3 scored'
      );
    });
  });

  describe('the results (decided 6A)', () => {
    // Made-up judges and entries.
    const input = {
      competition: 'graduate-poster' as const,
      rubricName: 'A rubric',
      criteria: [
        { guid: 'c-1', name: 'Clarity', maxPoints: 20 },
        { guid: 'c-2', name: 'Design', maxPoints: 10 }
      ],
      submissions: [
        { guid: 's-1', title: 'Rivers', presenters: ['Avery Example'] },
        { guid: 's-2', title: 'Aquifers', presenters: ['Blair Sample', 'Casey Test'] },
        { guid: 's-3', title: 'Not yet judged', presenters: [] }
      ],
      judges: [
        { guid: 'j-1', name: 'Dana Judge' },
        { guid: 'j-2', name: 'Emery Judge' }
      ],
      assessments: [
        { judge: 'j-1', submission: 's-1', scores: { 'c-1': 10, 'c-2': 5 }, total: 15 },
        { judge: 'j-2', submission: 's-1', scores: { 'c-1': 15, 'c-2': 10 }, total: 25 },
        { judge: 'j-1', submission: 's-2', scores: { 'c-1': 20, 'c-2': 9 }, total: 29 },
        // A judge since taken off the session: their scores still count.
        { judge: 'j-9', submission: 's-2', scores: { 'c-1': 18, 'c-2': 6 }, total: 24 },
        // Another competition's submission is left out.
        { judge: 'j-1', submission: 's-other', scores: { 'c-1': 1, 'c-2': 1 }, total: 2 }
      ]
    };

    it("averages the judges' totals and each criterion, highest first, those not judged last", () => {
      const results = judgingResults(input);

      expect(results.rows.map((r) => [r.title, r.judged, r.average])).toEqual([
        ['Aquifers', 2, 26.5],
        ['Rivers', 2, 20],
        ['Not yet judged', 0, null]
      ]);
      expect(results.rows[1].criteria).toEqual({ 'c-1': 12.5, 'c-2': 7.5 });
      expect(results.rows[1].totals).toEqual({ 'j-1': 15, 'j-2': 25, 'j-9': null });
      expect(results.rows[2].criteria).toEqual({ 'c-1': null, 'c-2': null });
    });

    it("gives each judge's progress, scored and still to score", () => {
      expect(judgingResults(input).judges).toEqual([
        { guid: 'j-1', name: 'Dana Judge', scored: 2, toScore: 1 },
        { guid: 'j-2', name: 'Emery Judge', scored: 1, toScore: 2 },
        { guid: 'j-9', name: 'A former judge', scored: 1, toScore: 2 }
      ]);
    });

    it('rounds an average to two places', () => {
      const results = judgingResults({
        ...input,
        assessments: [
          { judge: 'j-1', submission: 's-1', scores: { 'c-1': 10, 'c-2': 0 }, total: 10 },
          { judge: 'j-2', submission: 's-1', scores: { 'c-1': 10, 'c-2': 0 }, total: 10 },
          { judge: 'j-9', submission: 's-1', scores: { 'c-1': 11, 'c-2': 0 }, total: 11 }
        ]
      });

      expect(results.rows[0].average).toBe(10.33);
    });

    // #3193: one entry's line per judge, and every score as a table.
    it("breaks one entry down by judge: each criterion in the rubric's order, the total and the comment", () => {
      const results = judgingResults({
        ...input,
        assessments: input.assessments.map((a) =>
          a.judge === 'j-1' && a.submission === 's-1' ? { ...a, comment: 'Good.' } : a
        )
      });
      const rivers = results.rows.find((r) => r.guid === 's-1');

      if (!rivers) {
        throw new Error('the results have no row for s-1');
      }

      expect(judgeBreakdown(results, rivers)).toEqual([
        { guid: 'j-1', name: 'Dana Judge', scored: true, scores: [10, 5], total: 15, comment: 'Good.' },
        { guid: 'j-2', name: 'Emery Judge', scored: true, scores: [15, 10], total: 25, comment: null },
        { guid: 'j-9', name: 'A former judge', scored: false, scores: [null, null], total: null, comment: null }
      ]);
    });

    it('gives every score, a row per judge per entry, scored or not', () => {
      const table = everyScoreTable(judgingResults(input));

      expect(table.fields).toEqual([
        'Title',
        'Presenters',
        'Judge',
        'Clarity (of 20)',
        'Design (of 10)',
        'Total',
        'Comment'
      ]);
      expect(table.data).toHaveLength(3 * 3);
      expect(table.data[0]).toEqual(['Aquifers', 'Blair Sample; Casey Test', 'Dana Judge', 20, 9, 29, '']);
      expect(table.data[1]).toEqual(['Aquifers', 'Blair Sample; Casey Test', 'Emery Judge', '', '', 'Not scored yet', '']);
    });

    it('is a table for a CSV file, as the page shows it', () => {
      const table = judgingResultsTable(judgingResults(input));

      expect(table.fields).toEqual([
        'Rank',
        'Title',
        'Presenters',
        'Judges',
        'Average total',
        'Dana Judge',
        'Emery Judge',
        'A former judge',
        'Clarity (average of 20)',
        'Design (average of 10)'
      ]);
      expect(table.data[0]).toEqual([1, 'Aquifers', 'Blair Sample; Casey Test', 2, 26.5, 29, '', 24, 19, 7.5]);
      expect(table.data[2]).toEqual(['', 'Not yet judged', '', 0, '', '', '', '', '', '']);
    });
  });

  describe('the Ask to judge email', () => {
    // A made-up session.
    const session = {
      guid: 'e-1',
      name: 'Made-up poster session',
      mode: 'in-person',
      day: { date: '2026-11-19T06:00:00.000Z' },
      startTime: '13:00:00 GMT-0600 (Central Standard Time)',
      endTime: '14:15:00 GMT-0600 (Central Standard Time)',
      location: { building: 'MSC', room: '2300' }
    };

    it('is a kind of its own, named where sends are listed, with its own link', () => {
      expect(JUDGING_EMAIL_KIND).toBe('judging');
      expect(EMAIL_KIND_LABELS[JUDGING_EMAIL_KIND]).toBe('an Ask to judge email');
      expect(JUDGING_EMAIL_PLACEHOLDERS).toEqual(expect.arrayContaining(['{first name}', '{judging link}']));
      expect(JUDGING_EMAIL_PLACEHOLDERS).not.toContain('{edit link}');
      expect(JUDGING_COPY_EACH).toMatch(/own copy/);
    });

    it('names the competition and the session, with when and where', () => {
      expect(judgingEmailSubject('graduate-poster')).toBe('Judging the graduate poster competition at {site}');

      const text = judgingEmailTemplate(session, 'graduate-poster');

      expect(text).toContain('**graduate poster competition**');
      expect(text).toContain('**Made-up poster session**');
      expect(text).toContain('Thursday, November 19, 2026, 1:00 to 2:15 PM Central');
      expect(text).toContain('MSC 2300');
      expect(text).toContain('{judging link}');
    });

    it('leaves when and where to the details box in the design', () => {
      expect(judgingEmailTemplate(session, 'graduate-poster', true)).not.toContain('**When:**');
    });

    it("fills in as each judge gets it, with their own link and no edit link's", () => {
      const { subject, text } = fillProfileEmail(
        {
          subject: judgingEmailSubject('undergraduate-presentation'),
          template: judgingEmailTemplate(session, 'undergraduate-presentation')
        },
        judgingEmailValues(
          { firstName: 'Dana' },
          { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' },
          'https://gisday.tamu.edu/judging/LINK-OF-DANA',
          new Date('2026-11-22T18:00:00Z')
        )
      );

      expect(subject).toBe('Judging the undergraduate presentation competition at Texas A&M GIS Day');
      expect(text).toContain('Howdy Dana,');
      expect(text).toContain('https://gisday.tamu.edu/judging/LINK-OF-DANA');
      expect(text).not.toMatch(/\{[a-z ]+\}/);
    });

    it('refuses an edited email that drops the judging link', () => {
      expect(judgingEmailProblem({ subject: 'S', template: 'Score here: {judging link}' })).toBeNull();
      expect(judgingEmailProblem({ subject: 'S', template: 'Score here: {edit link}' })).toMatch(/\{judging link\}/);
    });

    it("wears a judge's header in Texas A&M's design, not a presenter's", () => {
      const details = { name: 'Made-up poster session', when: 'Thursday', where: 'MSC 2300' };

      expect(judgingEmailDesign('Texas A&M GIS Day', [], details)).toEqual(
        expect.objectContaining({ label: 'Your judging', session: details })
      );
      expect(judgingEmailDesign('Texas A&M GIS Day', [], details).why).toBe(
        'You are getting this email because you are judging at Texas A&M GIS Day.'
      );
      expect(sessionEmailDesign('Texas A&M GIS Day', [], details).label).toBe('Your session');
    });

    it('is previewed with a stand-in, never a real link', () => {
      expect(JUDGING_LINK_PREVIEW).not.toMatch(/judging\//);
    });
  });
});

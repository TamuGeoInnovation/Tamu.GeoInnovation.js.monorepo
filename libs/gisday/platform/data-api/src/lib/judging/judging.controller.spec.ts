import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';
import {
  DEFAULT_RUBRICS,
  JUDGING_CLOSED_MESSAGE,
  JudgePageDto,
  JudgingResultsDto,
  NOT_YOUR_COMPETITION_MESSAGE,
  RubricDto
} from '@tamu-gisc/gisday/common';

import { Assessment, Event, Rubric, RubricCriterion, Season, Speaker, Submission } from '../entities/all.entity';
import { SpeakerEditService, hashOf } from '../speaker-edit/speaker-edit.service';
import { Table } from '../_base/memory-table';
import { JudgeLinkGuard } from './judge-link.guard';
import { JudgingController, RubricController } from './judging.controller';
import { JudgingService } from './judging.service';
import { RubricService } from './rubric.service';

/**
 * #3183: judging the research competitions through Nest's real routing, guards and pipes, with the tables in memory.
 * A judge's link opens what they judge and saves their scores, and nothing else: no other link opens it, it never gives
 * an address, scores out of range and scores after judging closes are refused, and so is a submission outside the
 * judge's competitions. The admins read the results, and edit the rubrics.
 */
describe('Judging (#3183)', () => {
  const SEASON = '00000000-0000-4000-8000-000000002026';
  const JUDGE_LINK = 'j'.repeat(43);
  const OTHER_JUDGE_LINK = 'k'.repeat(43);
  const PROFILE_LINK = 'p'.repeat(43);
  const RIVERS = '11111111-1111-4111-8111-111111111111';
  const AQUIFERS = '22222222-2222-4222-8222-222222222222';
  const NOT_ACCEPTED = '33333333-3333-4333-8333-333333333333';
  const UNDERGRAD_TALK = '44444444-4444-4444-8444-444444444444';
  const UNDERGRAD_POSTER = '55555555-5555-4555-8555-555555555555';
  const later = new Date(Date.now() + 60 * 60 * 1000);

  // Made-up people.
  const dana = { guid: 'sp-da', firstName: 'Dana', lastName: 'Judge', email: 'dana@example.org', accountGuid: 'auth0|dana' };
  const emery = { guid: 'sp-em', firstName: 'Emery', lastName: 'Judge', email: 'emery@example.org', accountGuid: null };

  let app: INestApplication;
  let url: string;
  let permissions: Array<string> | null;
  let links: Table<Record<string, unknown> & { guid?: string }>;
  let events: Table<Event>;
  let submissions: Table<Submission>;
  let assessments: Table<Assessment>;
  let speakers: Table<Speaker>;
  let rubrics: Table<Rubric>;
  let criteria: Table<RubricCriterion>;

  const submission = (guid: string, title: string, classificationType: string, submissionType: string, acceptance = true) =>
    ({
      guid,
      title,
      classificationType,
      submissionType,
      acceptance,
      abstract: `About ${title.toLowerCase()}.`,
      format: 'individual',
      accountGuid: 'auth0|student',
      season: { guid: SEASON },
      participants: [
        { name: 'Avery Example', email: 'avery@example.org', studentId: '000000001' },
        { name: 'Blair Sample', email: 'blair@example.org' }
      ]
    }) as unknown as Submission;

  const jsonOf = (r: Response) => r.json();
  const page = (token: string) => fetch(`${url}/judging/link/${token}`);
  const score = (token: string, submissionGuid: string, body: unknown) =>
    fetch(`${url}/judging/link/${token}/${submissionGuid}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  const send = (method: string, path: string, body?: unknown) =>
    fetch(`${url}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  /** The poster rubric's criteria, as saved. */
  const posterCriteria = () =>
    criteria.rows.filter((c) => c.rubric.guid === 'r-poster').sort((a, b) => a.position - b.position);
  /** Full marks less one on every poster criterion. */
  const goodScores = () => Object.fromEntries(posterCriteria().map((c) => [c.guid, c.maxPoints - 1]));

  beforeEach(async () => {
    permissions = null;
    links = new Table((row) => row);
    links.rows = [
      { tokenHash: hashOf(JUDGE_LINK), purpose: 'judging', expires: later, speaker: { guid: dana.guid } },
      { tokenHash: hashOf(OTHER_JUDGE_LINK), purpose: 'judging', expires: later, speaker: { guid: emery.guid } },
      { tokenHash: hashOf(PROFILE_LINK), purpose: 'profile', expires: later, speaker: { guid: dana.guid } }
    ];
    speakers = new Table();
    speakers.rows = [dana, emery] as unknown as Array<Speaker>;
    events = new Table((row, relations) => ({
      ...row,
      judges: relations?.judges ? (row.judges ?? []).map((j) => speakers.rows.find((s) => s.guid === j.guid)) : row.judges
    }));
    events.rows = [
      {
        guid: 'e-posters',
        name: 'Graduate posters',
        season: { guid: SEASON },
        judgedCompetition: 'graduate-poster',
        judgingClosed: false,
        judges: [{ guid: dana.guid }, { guid: emery.guid }]
      },
      {
        guid: 'e-talks',
        name: 'Undergraduate talks',
        season: { guid: SEASON },
        judgedCompetition: 'undergraduate-presentation',
        judgingClosed: true,
        judges: [{ guid: dana.guid }]
      },
      { guid: 'e-lunch', name: 'Lunch', season: { guid: SEASON }, judgedCompetition: null, judges: [{ guid: dana.guid }] }
    ] as unknown as Array<Event>;
    submissions = new Table();
    submissions.rows = [
      submission(RIVERS, 'Rivers', 'graduate', 'poster'),
      submission(AQUIFERS, 'Aquifers', 'graduate', 'poster'),
      submission(NOT_ACCEPTED, 'Not accepted', 'graduate', 'poster', false),
      submission(UNDERGRAD_TALK, 'A talk', 'undergraduate', 'presentation'),
      submission(UNDERGRAD_POSTER, 'Not this judge’s', 'undergraduate', 'poster')
    ];
    assessments = new Table((row, relations) => ({
      ...row,
      ...(relations?.judge ? { judge: speakers.rows.find((s) => s.guid === row.judge.guid) } : {})
    }));
    criteria = new Table();
    rubrics = new Table((row, relations) => ({
      ...row,
      ...(relations?.criteria ? { criteria: criteria.rows.filter((c) => c.rubric.guid === row.guid) } : {})
    }));
    // The season's rubrics, the standard ones.
    for (const type of ['poster', 'presentation'] as const) {
      const { criteria: list, ...rubric } = DEFAULT_RUBRICS[type];

      rubrics.rows.push({ ...rubric, guid: `r-${type}`, season: { guid: SEASON } } as unknown as Rubric);
      list.forEach((c, position) =>
        criteria.rows.push({
          ...c,
          guid: `${type}-c${position}`,
          position,
          rubric: { guid: `r-${type}` }
        } as RubricCriterion)
      );
    }

    // One transaction is the same tables here.
    const manager = {
      transaction: async (work: (m: unknown) => Promise<unknown>) =>
        work({ getRepository: (entity: unknown) => (entity === Rubric ? rubrics : criteria) })
    };

    const module = await Test.createTestingModule({
      controllers: [JudgingController, RubricController],
      providers: [
        JudgingService,
        RubricService,
        JudgeLinkGuard,
        {
          provide: SpeakerEditService,
          // The speaker links' own check, over the links table.
          useFactory: () =>
            new SpeakerEditService(
              links as never,
              {} as never,
              {} as never,
              {} as never,
              {} as never,
              {} as never,
              {} as never,
              {} as never
            )
        },
        { provide: getRepositoryToken(Event), useValue: events },
        { provide: getRepositoryToken(Submission), useValue: submissions },
        { provide: getRepositoryToken(Assessment), useValue: assessments },
        { provide: getRepositoryToken(Speaker), useValue: speakers },
        { provide: getRepositoryToken(Rubric), useValue: Object.assign(rubrics, { manager }) },
        {
          provide: getRepositoryToken(Season),
          useValue: { findOne: async ({ where }) => (where.guid === SEASON ? { guid: SEASON } : null) }
        }
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          if (permissions === null) {
            return false;
          }

          context.switchToHttp().getRequest().user = { sub: 'admin-1', permissions };
          return true;
        }
      })
      .compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  afterEach(async () => {
    app.getHttpServer().closeAllConnections();
    await app.close();
  });

  describe("the judge's link", () => {
    it('lists each competition the judge judges, its rubric, and its accepted submissions by title', async () => {
      const response = await page(JUDGE_LINK);

      expect(response.status).toBe(200);

      const body: JudgePageDto = await jsonOf(response);

      expect([body.firstName, body.lastName]).toEqual(['Dana', 'Judge']);
      expect(body.competitions.map((c) => [c.competition, c.closed])).toEqual([
        ['graduate-poster', false],
        ['undergraduate-presentation', true]
      ]);

      const [posters] = body.competitions;

      expect(posters.rubric.name).toBe('Geography Poster Presentation Rubric');
      expect(posters.rubric.criteria).toHaveLength(7);
      expect(posters.sessions).toEqual([{ guid: 'e-posters', name: 'Graduate posters' }]);
      expect(posters.submissions.map((s) => s.title)).toEqual(['Aquifers', 'Rivers']);
      expect(posters.submissions[0]).toEqual({
        guid: AQUIFERS,
        title: 'Aquifers',
        presenters: ['Avery Example', 'Blair Sample'],
        abstract: 'About aquifers.',
        format: 'individual',
        assessment: null
      });
    });

    it("never gives anyone's address, account or student id", async () => {
      const text = await (await page(JUDGE_LINK)).text();

      expect(text).not.toContain('@');
      expect(text).not.toContain('auth0');
      expect(text).not.toContain('000000001');
      expect(text).not.toMatch(/email|accountGuid|studentId/);
    });

    it("is refused with a speaker's profile link, or no link, as a link that does not work", async () => {
      for (const token of [PROFILE_LINK, 'x'.repeat(43), 'short']) {
        const response = await page(token);

        expect(response.status).toBe(404);
        expect((await jsonOf(response)).message).toBe('This link has expired or is not valid. Ask for a new one.');
      }

      expect((await score(PROFILE_LINK, RIVERS, { scores: goodScores() })).status).toBe(404);
      expect(assessments.rows).toEqual([]);
    });
  });

  describe("saving a judge's scores", () => {
    it('saves a score per criterion, works out the total itself, and shows them on the judge’s page', async () => {
      const response = await score(JUDGE_LINK, RIVERS, { scores: goodScores(), total: 999, comment: '  Clear maps. ' });

      expect(response.status).toBe(200);

      const saved = await jsonOf(response);

      expect(saved.total).toBe(100 - 7);
      expect(saved.comment).toBe('Clear maps.');
      expect(assessments.rows).toHaveLength(1);
      expect(assessments.rows[0]).toEqual(
        expect.objectContaining({
          judge: { guid: dana.guid },
          submission: { guid: RIVERS },
          eventGuid: 'e-posters',
          total: 93
        })
      );

      const body: JudgePageDto = await jsonOf(await page(JUDGE_LINK));

      expect(body.competitions[0].submissions.find((s) => s.guid === RIVERS).assessment).toEqual(
        expect.objectContaining({ total: 93, comment: 'Clear maps.', scores: goodScores() })
      );
    });

    it('replaces what the judge saved before, keeping one row', async () => {
      await score(JUDGE_LINK, RIVERS, { scores: goodScores() });
      await score(JUDGE_LINK, RIVERS, { scores: Object.fromEntries(posterCriteria().map((c) => [c.guid, 0])) });

      expect(assessments.rows).toHaveLength(1);
      expect(assessments.rows[0].total).toBe(0);
    });

    it.each([
      ['above its points', (max: number) => max + 1],
      ['below zero', () => -1],
      ['not a whole number', () => 2.5],
      ['text', () => '5']
    ])('refuses a score %s, and saves nothing', async (_, bad) => {
      const scores = goodScores();
      const [first] = posterCriteria();

      scores[first.guid] = bad(first.maxPoints) as number;

      const response = await score(JUDGE_LINK, RIVERS, { scores });

      expect(response.status).toBe(400);
      expect((await jsonOf(response)).message).toBe(
        `Geographic Understanding & Accuracy is scored as a whole number from 0 to ${first.maxPoints}.`
      );
      expect(assessments.rows).toEqual([]);
    });

    it('refuses scores missing a criterion', async () => {
      const scores = goodScores();

      delete scores[posterCriteria()[6].guid];

      const response = await score(JUDGE_LINK, RIVERS, { scores });

      expect(response.status).toBe(400);
      expect((await jsonOf(response)).message).toBe('Give a score for Interpretation & Geographic Insight.');
    });

    it('refuses a submission outside the judge’s competitions, or not accepted, as not theirs', async () => {
      for (const guid of [UNDERGRAD_POSTER, NOT_ACCEPTED]) {
        const response = await score(JUDGE_LINK, guid, { scores: goodScores() });

        expect(response.status).toBe(403);
        expect((await jsonOf(response)).message).toBe(NOT_YOUR_COMPETITION_MESSAGE);
      }

      expect(assessments.rows).toEqual([]);
    });

    it('refuses any change once the admins have closed judging for the session', async () => {
      const presentation = criteria.rows.filter((c) => c.rubric.guid === 'r-presentation');
      const response = await score(JUDGE_LINK, UNDERGRAD_TALK, {
        scores: Object.fromEntries(presentation.map((c) => [c.guid, 5]))
      });

      expect(response.status).toBe(403);
      expect((await jsonOf(response)).message).toBe(JUDGING_CLOSED_MESSAGE);
      expect(assessments.rows).toEqual([]);
    });

    it("shows a judge only their own scores, never another judge's (decided 5A)", async () => {
      await score(JUDGE_LINK, RIVERS, { scores: goodScores(), comment: 'Dana’s view.' });

      const other = await (await page(OTHER_JUDGE_LINK)).text();
      const body: JudgePageDto = JSON.parse(other);

      expect(body.competitions.map((c) => c.competition)).toEqual(['graduate-poster']);
      expect(body.competitions[0].submissions.every((s) => s.assessment === null)).toBe(true);
      expect(other).not.toContain('Dana’s view.');
    });
  });

  describe('the results, for the admins', () => {
    const results = (competition = 'graduate-poster') =>
      fetch(`${url}/judging/results?season=${SEASON}&competition=${competition}`);

    it('need read:competitions', async () => {
      expect((await results()).status).toBe(403);

      permissions = ['read:events'];
      expect((await results()).status).toBe(403);
    });

    it("give each judge's total, the average of the totals, each criterion's average, and each judge's progress", async () => {
      await score(JUDGE_LINK, RIVERS, { scores: goodScores() });
      await score(OTHER_JUDGE_LINK, RIVERS, { scores: Object.fromEntries(posterCriteria().map((c) => [c.guid, 5])) });
      await score(OTHER_JUDGE_LINK, AQUIFERS, { scores: Object.fromEntries(posterCriteria().map((c) => [c.guid, 10])) });
      permissions = ['read:competitions'];

      const response = await results();

      expect(response.status).toBe(200);

      const body: JudgingResultsDto = await jsonOf(response);

      expect(body.rows.map((r) => [r.title, r.judged, r.average])).toEqual([
        ['Aquifers', 1, 70],
        ['Rivers', 2, (93 + 35) / 2]
      ]);
      expect(body.rows[1].totals).toEqual({ [dana.guid]: 93, [emery.guid]: 35 });
      expect(body.rows[1].criteria[posterCriteria()[0].guid]).toBe((19 + 5) / 2);
      expect(body.judges).toEqual([
        { guid: dana.guid, name: 'Dana Judge', scored: 1, toScore: 1 },
        { guid: emery.guid, name: 'Emery Judge', scored: 2, toScore: 0 }
      ]);
      expect(JSON.stringify(body)).not.toContain('@');
    });

    // #3193: each entry's breakdown, a judge's own score on each criterion and their comment, for the admins only.
    it("give each judge's own scores and comment on each entry, and null for a judge who has not scored it", async () => {
      await score(JUDGE_LINK, RIVERS, { scores: goodScores(), comment: 'Clear maps, "careful" sources.' });
      permissions = ['read:competitions'];

      const body: JudgingResultsDto = await jsonOf(await results());
      const rivers = body.rows.find((r) => r.title === 'Rivers');

      expect(rivers.assessments[dana.guid]).toEqual({
        scores: goodScores(),
        total: 93,
        comment: 'Clear maps, "careful" sources.'
      });
      expect(rivers.assessments[emery.guid]).toBeNull();

      // Still refused to anyone who may not read the competitions, the comments with them.
      permissions = ['update:events'];
      const refused = await results();

      expect(refused.status).toBe(403);
      expect(await refused.text()).not.toContain('careful');
    });

    it("leave a judge's own page as it was: their own scores only, never another judge's comment", async () => {
      await score(OTHER_JUDGE_LINK, RIVERS, { scores: goodScores(), comment: 'Emery’s private view.' });

      const mine = await (await page(JUDGE_LINK)).text();

      expect(mine).not.toContain('Emery’s private view.');
      expect(mine).not.toContain('assessments');
    });

    it('refuse a competition no session can judge', async () => {
      permissions = ['read:competitions'];

      expect((await results('graduate-paper')).status).toBe(400);
    });
  });

  describe('the rubrics, for the admins', () => {
    it('are read with read:competitions, posters first, criteria in order', async () => {
      expect((await send('GET', `/rubrics/season/${SEASON}`)).status).toBe(403);

      permissions = ['read:competitions'];

      const body: Array<RubricDto> = await jsonOf(await send('GET', `/rubrics/season/${SEASON}`));

      expect(body.map((r) => r.competitionType)).toEqual(['poster', 'presentation']);
      expect(body[0].criteria.map((c) => c.position)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(body[0].criteria[0].levels).toHaveLength(4);
    });

    it('are changed only with update:competitions', async () => {
      permissions = ['read:competitions'];

      expect((await send('PUT', '/rubrics/r-poster', DEFAULT_RUBRICS.poster)).status).toBe(403);
      expect((await send('POST', '/rubrics', { ...DEFAULT_RUBRICS.poster, season: SEASON })).status).toBe(403);
    });

    it("replace a rubric's criteria on save, keeping the ids of those kept so judges' scores stay with them", async () => {
      permissions = ['update:competitions'];

      const [first, , ...rest] = posterCriteria();
      const response = await send('PUT', '/rubrics/r-poster', {
        name: 'Edited rubric',
        description: 'Made-up words.',
        criteria: [
          { ...rest[0], name: 'Moved first' },
          { guid: first.guid, name: first.name, maxPoints: 25, levels: first.levels },
          { name: 'A new criterion', maxPoints: 5, levels: [] }
        ]
      });

      expect(response.status).toBe(200);

      const saved: RubricDto = await jsonOf(response);

      expect(saved.name).toBe('Edited rubric');
      expect(saved.competitionType).toBe('poster');
      expect(saved.criteria.map((c) => [c.name, c.maxPoints, c.position])).toEqual([
        ['Moved first', 15, 0],
        [first.name, 25, 1],
        ['A new criterion', 5, 2]
      ]);
      expect(saved.criteria[1].guid).toBe(first.guid);
      expect(saved.criteria[0].guid).toBe(rest[0].guid);
      expect(posterCriteria()).toHaveLength(3);
    });

    it.each([
      ['no name', { name: '' }, 'The rubric needs a name, up to 255 characters.'],
      ['no criteria', { criteria: [] }, 'A rubric needs at least one criterion.'],
      [
        'points that are not a positive whole number',
        { criteria: [{ name: 'A', maxPoints: 0, levels: [] }] },
        "Criterion 1's points must be a whole number from 1 to 1000."
      ],
      [
        'a criterion with no name',
        { criteria: [{ name: ' ', maxPoints: 5, levels: [] }] },
        'Criterion 1 needs a name, up to 255 characters.'
      ]
    ])('refuse a rubric with %s', async (_, change, message) => {
      permissions = ['update:competitions'];

      const response = await send('PUT', '/rubrics/r-poster', { ...DEFAULT_RUBRICS.poster, ...change });

      expect(response.status).toBe(400);
      expect((await jsonOf(response)).message).toBe(message);
      expect(posterCriteria()).toHaveLength(7);
    });

    it('start a season from the standard rubric, once per competition type', async () => {
      permissions = ['update:competitions'];
      rubrics.rows = [];
      criteria.rows = [];

      const created = await send('POST', '/rubrics', { ...DEFAULT_RUBRICS.presentation, season: SEASON });

      expect(created.status).toBe(201);
      expect(((await jsonOf(created)) as RubricDto).criteria.map((c) => c.maxPoints)).toEqual([20, 20, 15, 15, 10, 10, 10]);

      const again = await send('POST', '/rubrics', { ...DEFAULT_RUBRICS.presentation, season: SEASON });

      expect(again.status).toBe(409);
      expect(rubrics.rows).toHaveLength(1);
    });
  });
});

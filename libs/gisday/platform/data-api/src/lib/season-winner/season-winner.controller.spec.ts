import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';
import { SeasonWinnersAdminDto } from '@tamu-gisc/gisday/common';

import { Season, SeasonWinner, Submission } from '../entities/all.entity';
import { Table } from '../_base/memory-table';
import { SeasonWinnerController } from './season-winner.controller';
import { NOT_AN_ENTRY_MESSAGE, SeasonWinnerService } from './season-winner.service';

/**
 * #3239: a season's winners through Nest's real routing, guards and pipes, with the tables in memory. The admins pick 1st,
 * 2nd and 3rd of each judged competition from the season's accepted submissions; the homepage reads them once the
 * season's GIS Day is over, with nothing but place, names and title. Made-up people and entries only.
 */
describe('Season winners (#3239)', () => {
  const SEASON = '00000000-0000-4000-8000-000000002026';
  const RIVERS = '11111111-1111-4111-8111-111111111111';
  const AQUIFERS = '22222222-2222-4222-8222-222222222222';
  const DUNES = '33333333-3333-4333-8333-333333333333';
  const NOT_ACCEPTED = '44444444-4444-4444-8444-444444444444';
  const UNDERGRAD_TALK = '55555555-5555-4555-8555-555555555555';
  const OTHER_SEASON = '66666666-6666-4666-8666-666666666666';

  let app: INestApplication;
  let url: string;
  let permissions: Array<string> | null;
  let seasons: Table<Season>;
  let submissions: Table<Submission>;
  let winners: Table<SeasonWinner>;
  /** The days of the active season: its GIS Day is over unless a test says otherwise. */
  let days: Array<{ date: string }>;

  const submission = (
    guid: string,
    title: string,
    classificationType: string,
    submissionType: string,
    acceptance = true,
    season = SEASON
  ) =>
    ({
      guid,
      title,
      classificationType,
      submissionType,
      acceptance,
      abstract: `About ${title.toLowerCase()}.`,
      accountGuid: 'auth0|student',
      season: { guid: season },
      participants: [
        { name: 'Avery Example', email: 'avery@example.org', studentId: '000000001' },
        { name: 'Blair Sample', email: 'blair@example.org' }
      ]
    }) as unknown as Submission;

  const send = (method: string, path: string, body?: unknown) =>
    fetch(`${url}${path}`, {
      method,
      headers: { 'content-type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  const pick = (choices: Array<{ competition: string; place: number; submission: string | null }>) =>
    send('PUT', `/season-winners/season/${SEASON}`, { winners: choices });

  beforeEach(async () => {
    permissions = null;
    days = [{ date: '2025-11-17T06:00:00.000Z' }, { date: '2025-11-21T06:00:00.000Z' }];
    seasons = new Table((row, relations) => ({ ...row, ...(relations?.days ? { days } : {}) }));
    seasons.rows = [{ guid: SEASON, year: 2026, active: true } as Season];
    submissions = new Table();
    submissions.rows = [
      submission(RIVERS, 'Rivers', 'graduate', 'poster'),
      submission(AQUIFERS, 'Aquifers', 'graduate', 'poster'),
      submission(DUNES, 'Dunes', 'graduate', 'poster'),
      submission(NOT_ACCEPTED, 'Not accepted', 'graduate', 'poster', false),
      submission(UNDERGRAD_TALK, 'A talk', 'undergraduate', 'presentation'),
      submission(OTHER_SEASON, 'Last year', 'graduate', 'poster', true, 'season-2025')
    ];
    winners = new Table((row, relations) => ({
      ...row,
      ...(relations?.submission && row.submission
        ? { submission: submissions.rows.find((s) => s.guid === row.submission.guid) }
        : {})
    }));

    // One transaction is the same table here.
    const manager = {
      transaction: async (work: (m: unknown) => Promise<unknown>) => work({ getRepository: () => winners })
    };

    const module = await Test.createTestingModule({
      controllers: [SeasonWinnerController],
      providers: [
        SeasonWinnerService,
        { provide: getRepositoryToken(SeasonWinner), useValue: Object.assign(winners, { manager }) },
        { provide: getRepositoryToken(Season), useValue: seasons },
        { provide: getRepositoryToken(Submission), useValue: submissions }
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

    app = module.createNestApplication();
    await app.listen(0);
    url = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('the Winners page', () => {
    it("lists each judged competition's accepted entries this season, by title, with their people's names only", async () => {
      permissions = ['read:competitions'];

      const page = (await (await send('GET', `/season-winners/season/${SEASON}`)).json()) as SeasonWinnersAdminDto;

      expect(page.competitions.map((c) => c.competition)).toEqual([
        'graduate-poster',
        'undergraduate-poster',
        'graduate-presentation',
        'undergraduate-presentation'
      ]);
      expect(page.competitions[0].entries).toEqual([
        { guid: AQUIFERS, title: 'Aquifers', names: ['Avery Example', 'Blair Sample'] },
        { guid: DUNES, title: 'Dunes', names: ['Avery Example', 'Blair Sample'] },
        { guid: RIVERS, title: 'Rivers', names: ['Avery Example', 'Blair Sample'] }
      ]);
      expect(page.competitions[3].entries.map((e) => e.title)).toEqual(['A talk']);
      expect(page.winners).toEqual([]);
      expect(JSON.stringify(page)).not.toMatch(/example\.org|000000001|auth0\|/);
    });

    it('saves the places picked, and replaces them when saved again', async () => {
      permissions = ['update:competitions'];

      expect(
        (
          await pick([
            { competition: 'graduate-poster', place: 1, submission: RIVERS },
            { competition: 'graduate-poster', place: 2, submission: AQUIFERS },
            { competition: 'undergraduate-presentation', place: 1, submission: UNDERGRAD_TALK }
          ])
        ).status
      ).toBe(200);

      const again = await pick([
        { competition: 'graduate-poster', place: 1, submission: AQUIFERS },
        { competition: 'graduate-poster', place: 3, submission: DUNES },
        { competition: 'graduate-poster', place: 2, submission: null }
      ]);

      expect(((await again.json()) as SeasonWinnersAdminDto).winners).toEqual([
        { competition: 'graduate-poster', place: 1, submission: AQUIFERS },
        { competition: 'graduate-poster', place: 3, submission: DUNES }
      ]);
      expect(winners.rows).toHaveLength(2);
    });

    it("leaves the trail challenge's places as they are", async () => {
      permissions = ['update:competitions'];
      winners.rows = [
        { guid: 'w-trail', season: { guid: SEASON }, competition: 'trail', place: 1, accountGuid: 'auth0|x' }
      ] as Array<SeasonWinner>;

      await pick([{ competition: 'graduate-poster', place: 1, submission: RIVERS }]);

      expect(winners.rows.map((r) => r.competition).sort()).toEqual(['graduate-poster', 'trail']);
    });

    it.each([
      ['not accepted', NOT_ACCEPTED, 'graduate-poster'],
      ['in another season', OTHER_SEASON, 'graduate-poster'],
      ['in another competition', UNDERGRAD_TALK, 'graduate-poster']
    ])('refuses a submission %s', async (_, guid, competition) => {
      permissions = ['update:competitions'];

      const refused = await pick([{ competition, place: 1, submission: guid }]);

      expect(refused.status).toBe(400);
      expect(((await refused.json()) as { message: string }).message).toBe(NOT_AN_ENTRY_MESSAGE);
      expect(winners.rows).toEqual([]);
    });

    it('refuses a place sent twice, and a submission in two places', async () => {
      permissions = ['update:competitions'];

      expect(
        (
          await pick([
            { competition: 'graduate-poster', place: 1, submission: RIVERS },
            { competition: 'graduate-poster', place: 2, submission: RIVERS }
          ])
        ).status
      ).toBe(400);
      expect(winners.rows).toEqual([]);
    });

    it('is for admins: reading needs read:competitions, saving update:competitions', async () => {
      expect((await send('GET', `/season-winners/season/${SEASON}`)).status).toBe(403);

      permissions = ['read:competitions'];
      expect((await pick([{ competition: 'graduate-poster', place: 1, submission: RIVERS }])).status).toBe(403);
      expect(winners.rows).toEqual([]);
    });
  });

  describe('the homepage', () => {
    beforeEach(() => {
      winners.rows = [
        { guid: 'w2', season: { guid: SEASON }, competition: 'graduate-poster', place: 2, submission: { guid: AQUIFERS } },
        { guid: 'w1', season: { guid: SEASON }, competition: 'graduate-poster', place: 1, submission: { guid: RIVERS } },
        {
          guid: 'w3',
          season: { guid: SEASON },
          competition: 'undergraduate-presentation',
          place: 1,
          submission: { guid: UNDERGRAD_TALK }
        },
        { guid: 'w4', season: { guid: SEASON }, competition: 'trail', place: 1, accountGuid: 'auth0|walker' }
      ] as Array<SeasonWinner>;
    });

    it('shows the winners, signed out, with only place, names and title, in order', async () => {
      const answer = await send('GET', '/season-winners');

      expect(answer.status).toBe(200);
      expect(await answer.json()).toEqual({
        year: 2026,
        competitions: [
          {
            competition: 'graduate-poster',
            label: 'Graduate poster competition',
            winners: [
              { place: 1, names: ['Avery Example', 'Blair Sample'], title: 'Rivers' },
              { place: 2, names: ['Avery Example', 'Blair Sample'], title: 'Aquifers' }
            ]
          },
          {
            competition: 'undergraduate-presentation',
            label: 'Undergraduate presentation competition',
            winners: [{ place: 1, names: ['Avery Example', 'Blair Sample'], title: 'A talk' }]
          }
        ]
      });
    });

    it('shows nothing while the season is still to come or going on', async () => {
      days = [{ date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }];

      expect(await (await send('GET', '/season-winners')).text()).toBe('');
    });

    it('shows nothing when none have been picked', async () => {
      winners.rows = [];

      expect(await (await send('GET', '/season-winners')).text()).toBe('');
    });
  });
});

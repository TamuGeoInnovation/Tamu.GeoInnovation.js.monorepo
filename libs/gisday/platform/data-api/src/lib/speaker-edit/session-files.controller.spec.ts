import { existsSync, mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { ExecutionContext, INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator } from 'typeorm';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';
import { SUBMISSION_FILE_RULES, submissionFileProblem } from '@tamu-gisc/gisday/common';

import { Asset, Speaker } from '../entities/all.entity';
import { AssetsService } from '../assets/assets.service';
import { uploadingDirectory } from '../user-submission/submission-files.service';
import { SessionFilesController } from './session-files.controller';
import { SESSION_FILE_TYPE, SessionFilesService } from './session-files.service';
import { SpeakerEditLinkGuard } from './speaker-edit-link.guard';
import { SpeakerEditService } from './speaker-edit.service';

/**
 * #3093: speakers upload their sessions' slides from their edit link, with no account, and only the admins see them.
 * Nest's real routing, Multer and `PermissionsGuard` run, with a folder standing in for APP_DATA, so a test sees a file
 * kept, replaced, refused and removed as the API would. Only the link's lookup and the sign-in are replaced.
 */
describe('SessionFilesController (#3093)', () => {
  const TOKEN = 'a'.repeat(43);
  const OTHER_TOKEN = 'b'.repeat(43);
  const SEASON = '00000000-0000-4000-8000-000000002026';
  const MINE = '11111111-1111-4111-8111-111111111111';
  const MINE_TOO = '22222222-2222-4222-8222-222222222222';
  const NOT_MINE = '33333333-3333-4333-8333-333333333333';
  const LAST_YEAR = '44444444-4444-4444-8444-444444444444';

  let app: INestApplication;
  let url: string;
  let appData: string;
  let previousAppData: string | undefined;
  let permissions: Array<string> | null;
  let rows: Array<Asset>;

  const day = (date: string) => ({ date: new Date(date) });
  const speakers: Record<string, unknown> = {
    'speaker-1': {
      guid: 'speaker-1',
      season: { guid: SEASON },
      events: [
        {
          guid: MINE_TOO,
          name: 'Lightning talks',
          startTime: '14:00',
          day: day('2026-11-19T06:00:00Z'),
          season: { guid: SEASON }
        },
        {
          guid: MINE,
          name: 'Mapping Texas watersheds',
          startTime: '09:30',
          endTime: '10:15',
          day: day('2026-11-18T06:00:00Z'),
          location: { building: 'Eller O&M', room: '1003' },
          season: { guid: SEASON }
        },
        { guid: LAST_YEAR, name: 'An old session', season: { guid: 'last-season' } }
      ]
    },
    'speaker-2': { guid: 'speaker-2', season: { guid: SEASON }, events: [{ guid: NOT_MINE, name: 'Not yours' }] }
  };

  /** The link's own check, as the edit page has it: a token of the right shape that is on record, or not found. */
  const linkFor = jest.fn(async (token: string) => {
    const speaker = { [TOKEN]: 'speaker-1', [OTHER_TOKEN]: 'speaker-2' }[token];

    if (!speaker) {
      throw new NotFoundException('This link has expired or is not valid. Ask for a new one.');
    }

    return { speaker: { guid: speaker } };
  });

  /** The assets table, as far as these routes read it. */
  const assetRepo = {
    create: (a: Partial<Asset>) => a,
    save: jest.fn(async (a: Asset) => {
      const row = { ...a, created: new Date() } as Asset;
      rows.push(row);
      return row;
    }),
    delete: jest.fn(async (guids: Array<string>) => {
      rows = rows.filter((r) => !guids.includes(r.guid));
    }),
    find: jest.fn(async ({ where }) => {
      const events = where.event?.guid instanceof FindOperator ? (where.event.guid.value as Array<string>) : null;
      const season = where.event?.season?.guid;

      return rows
        .filter((r) => r.type === where.type)
        .filter((r) => (events ? events.includes(r.event.guid) : true))
        .filter((r) => (season ? seasonOf(r.event.guid) === season : true))
        .map((r) => ({ ...r }));
    })
  };

  function seasonOf(eventGuid: string): string | undefined {
    return Object.values(speakers)
      .flatMap((s) => (s as { events: Array<{ guid: string; season?: { guid: string } }> }).events)
      .find((e) => e.guid === eventGuid)?.season?.guid;
  }

  const as = (held: Array<string> | null) => {
    permissions = held;
  };

  function upload(token: string, event: string, name: string, bytes = 1024) {
    const body = new FormData();
    body.append('file', new Blob([Buffer.alloc(bytes, 7)]), name);

    return fetch(`${url}/session-files/link/${token}/${event}`, { method: 'POST', body });
  }

  const sessions = (token: string) => fetch(`${url}/session-files/link/${token}`);
  const kept = () =>
    existsSync(join(appData, 'sessions')) ? readdirSync(join(appData, 'sessions'), { recursive: true }) : [];
  const leftUploading = () => (existsSync(uploadingDirectory()) ? readdirSync(uploadingDirectory()) : []);

  beforeEach(async () => {
    previousAppData = process.env.APP_DATA;
    appData = mkdtempSync(join(tmpdir(), 'gisday-slides-'));
    process.env.APP_DATA = appData;
    rows = [];
    permissions = null;
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [SessionFilesController],
      providers: [
        SessionFilesService,
        SpeakerEditLinkGuard,
        { provide: SpeakerEditService, useValue: { linkFor } },
        {
          provide: getRepositoryToken(Speaker),
          useValue: { findOne: async ({ where }) => structuredClone(speakers[where.guid]) ?? null }
        },
        { provide: getRepositoryToken(Asset), useValue: assetRepo },
        {
          provide: AssetsService,
          useValue: {
            deleteAssetFiles: async (assets: Array<Asset>) => assets.forEach((a) => rmSync(join(appData, a.path)))
          }
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
    await app.close();
    rmSync(appData, { recursive: true, force: true });
    process.env.APP_DATA = previousAppData;
  });

  describe("the speaker's edit link", () => {
    it('lists the sessions the speaker presents this season, by day, with when and where and no slides yet', async () => {
      const response = await sessions(TOKEN);

      expect(response.status).toBe(200);

      const listed = await response.json();

      expect(listed.map((s) => s.guid)).toEqual([MINE, MINE_TOO]);
      expect(listed[0]).toEqual({
        guid: MINE,
        name: 'Mapping Texas watersheds',
        date: '2026-11-18T06:00:00.000Z',
        startTime: '09:30',
        endTime: '10:15',
        place: 'Eller O&M 1003',
        file: null
      });
    });

    it('refuses a link that does not work, in the edit page’s own words, before reading anything', async () => {
      const response = await sessions('c'.repeat(43));

      expect(response.status).toBe(404);
      expect((await response.json()).message).toBe('This link has expired or is not valid. Ask for a new one.');
    });

    it('keeps an upload at once, with no approval, and lists it with its name, size and when', async () => {
      const response = await upload(TOKEN, MINE, 'Café watersheds.pptx', 2048);

      expect(response.status).toBe(201);
      expect(await response.json()).toEqual(expect.objectContaining({ name: 'Café watersheds.pptx', size: 2048 }));
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual(expect.objectContaining({ type: SESSION_FILE_TYPE, event: { guid: MINE } }));
      expect(rows[0].path).toBe(`sessions/${MINE}/${rows[0].guid}.pptx`);
      expect(existsSync(join(appData, rows[0].path))).toBe(true);
      expect(leftUploading()).toEqual([]);

      const listed = await (await sessions(TOKEN)).json();

      expect(listed[0].file).toEqual(expect.objectContaining({ name: 'Café watersheds.pptx', size: 2048 }));
      expect(listed[1].file).toBeNull();
    });

    it('replaces the slides with the next upload, removing the file before', async () => {
      await upload(TOKEN, MINE, 'draft.pdf');
      const first = rows[0];

      expect((await upload(TOKEN, MINE, 'final.pdf', 4096)).status).toBe(201);

      expect(rows.map((r) => r.name)).toEqual(['final.pdf']);
      expect(existsSync(join(appData, first.path))).toBe(false);
      expect(kept().filter((f) => String(f).endsWith('.pdf'))).toHaveLength(1);
    });

    it('removes the slides', async () => {
      await upload(TOKEN, MINE, 'deck.pdf');
      const path = rows[0].path;

      expect((await fetch(`${url}/session-files/link/${TOKEN}/${MINE}`, { method: 'DELETE' })).status).toBe(204);

      expect(rows).toEqual([]);
      expect(existsSync(join(appData, path))).toBe(false);
      expect((await fetch(`${url}/session-files/link/${TOKEN}/${MINE}`, { method: 'DELETE' })).status).toBe(404);
    });

    it("touches only the speaker's own sessions: another's, or last season's, reads as not found, and nothing is kept", async () => {
      for (const event of [NOT_MINE, LAST_YEAR, 'not-a-session']) {
        const response = await upload(TOKEN, event, 'deck.pdf');

        expect(response.status).toBe(404);
      }

      await upload(OTHER_TOKEN, NOT_MINE, 'theirs.pdf');

      expect((await fetch(`${url}/session-files/link/${TOKEN}/${NOT_MINE}`, { method: 'DELETE' })).status).toBe(404);
      expect(rows.map((r) => r.name)).toEqual(['theirs.pdf']);
      expect(leftUploading()).toEqual([]);
    });

    it('refuses a link that does not work before the file is received', async () => {
      const response = await upload('c'.repeat(43), MINE, 'deck.pdf');

      expect(response.status).toBe(404);
      expect(rows).toEqual([]);
      expect(leftUploading()).toEqual([]);
    });

    it("checks the file by the submission files' own rules and words", async () => {
      const response = await upload(TOKEN, MINE, 'notes.docx');

      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe(
        'notes.docx is not a PowerPoint or PDF file. Only .pdf, .ppt and .pptx files can be attached.'
      );

      const empty = await upload(TOKEN, MINE, 'empty.pdf', 0);

      expect(empty.status).toBe(400);
      expect((await empty.json()).message).toBe(submissionFileProblem('empty.pdf', 0, 0));
      expect(rows).toEqual([]);
      expect(leftUploading()).toEqual([]);
    });

    it('cuts off a file over the size limit, as a submission file is', async () => {
      const response = await upload(TOKEN, MINE, 'huge.pdf', SUBMISSION_FILE_RULES.maxBytes + 1);

      expect(response.status).toBe(413);
      expect(rows).toEqual([]);
    });

    it('offers the speaker no download, and no admin route through a link', async () => {
      await upload(TOKEN, MINE, 'deck.pdf');

      expect((await fetch(`${url}/session-files/link/${TOKEN}/${MINE}/${rows[0].guid}`)).status).toBe(404);
    });
  });

  describe('the admins', () => {
    beforeEach(async () => {
      await upload(TOKEN, MINE, 'Watersheds.pdf', 3000);
    });

    it("lists a session's slides and downloads the original under its own name", async () => {
      as(['update:events']);

      const files = await (await fetch(`${url}/session-files/event/${MINE}`)).json();

      expect(files).toEqual([expect.objectContaining({ name: 'Watersheds.pdf', size: 3000 })]);

      const download = await fetch(`${url}/session-files/event/${MINE}/${files[0].guid}`);

      expect(download.status).toBe(200);
      expect(download.headers.get('content-type')).toBe('application/pdf');
      expect(download.headers.get('content-disposition')).toContain('filename="Watersheds.pdf"');
      expect((await download.arrayBuffer()).byteLength).toBe(3000);
    });

    it('lists which of a season’s sessions have slides', async () => {
      as(['update:events']);

      const listed = await (await fetch(`${url}/session-files/season/${SEASON}`)).json();

      expect(listed).toEqual([{ event: MINE, file: expect.objectContaining({ name: 'Watersheds.pdf' }) }]);
    });

    it('refuses anyone who may not edit sessions, signed in or not', async () => {
      const guid = rows[0].guid;

      for (const held of [null, [], ['read:competitions', 'update:speakers']]) {
        as(held);

        for (const path of [`event/${MINE}`, `event/${MINE}/${guid}`, `season/${SEASON}`]) {
          expect((await fetch(`${url}/session-files/${path}`)).status).toBe(403);
        }
      }
    });
  });
});

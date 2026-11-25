import { existsSync, mkdtempSync, readdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { ExecutionContext, INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOperator } from 'typeorm';
import JSZip from 'jszip';

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
 * #3093: speakers upload their sessions' slides from their edit link, with no account: each speaker their own, up to
 * three files a session, seen and removed by that speaker only; the admins see every speaker's, labelled with who.
 * Nest's real routing, Multer and `PermissionsGuard` run, with a folder standing in for APP_DATA, so a test sees a file
 * kept, refused and removed as the API would. Only the link's lookup and the sign-in are replaced.
 */
describe('SessionFilesController (#3093)', () => {
  const TOKEN = 'a'.repeat(43);
  const OTHER_TOKEN = 'b'.repeat(43);
  const SEASON = '00000000-0000-4000-8000-000000002026';
  const MINE = '11111111-1111-4111-8111-111111111111';
  const MINE_TOO = '22222222-2222-4222-8222-222222222222';
  const NOT_MINE = '33333333-3333-4333-8333-333333333333';
  const LAST_YEAR = '44444444-4444-4444-8444-444444444444';
  const PANEL = '55555555-5555-4555-8555-555555555555';

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
      // Made-up people.
      firstName: 'Avery',
      lastName: 'Example',
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
        { guid: LAST_YEAR, name: 'An old session', season: { guid: 'last-season' } },
        // A session with no slides (#3147).
        {
          guid: PANEL,
          name: 'A made-up panel',
          startTime: '11:00',
          day: day('2026-11-20T06:00:00Z'),
          season: { guid: SEASON },
          noSlides: true
        }
      ]
    },
    // A second speaker on the first speaker's session, and on one of their own.
    'speaker-2': {
      guid: 'speaker-2',
      firstName: 'Blair',
      lastName: 'Sample',
      season: { guid: SEASON },
      events: [
        { guid: NOT_MINE, name: 'Not yours' },
        { guid: MINE, name: 'Mapping Texas watersheds', season: { guid: SEASON } }
      ]
    }
  };

  /** The link's own check, as the edit page has it: a token of the right shape that is on record, or not found. */
  const linkFor = vi.fn(async (token: string) => {
    const speaker = { [TOKEN]: 'speaker-1', [OTHER_TOKEN]: 'speaker-2' }[token];

    if (!speaker) {
      throw new NotFoundException('This link has expired or is not valid. Ask for a new one.');
    }

    return { speaker: { guid: speaker } };
  });

  /** The assets table, as far as these routes read it. */
  const assetRepo = {
    create: (a: Partial<Asset>) => a,
    save: vi.fn(async (a: Asset) => {
      const row = { ...a, created: new Date() } as Asset;
      rows.push(row);
      return row;
    }),
    delete: vi.fn(async (guids: Array<string>) => {
      rows = rows.filter((r) => !guids.includes(r.guid));
    }),
    find: vi.fn(async ({ where, relations }) => {
      const events =
        where.event?.guid instanceof FindOperator
          ? (where.event.guid.value as Array<string>)
          : typeof where.event?.guid === 'string'
            ? [where.event.guid]
            : null;
      const season = where.event?.season?.guid;
      const uploader = where.uploadedBy?.guid;

      return rows
        .filter((r) => r.type === where.type)
        .filter((r) => (where.guid ? r.guid === where.guid : true))
        .filter((r) => (events ? events.includes(r.event.guid) : true))
        .filter((r) => (season ? seasonOf(r.event.guid) === season : true))
        .filter((r) => (uploader ? r.uploadedBy?.guid === uploader : true))
        .map((r) => ({
          ...r,
          // The speaker's record, when it is asked for, as the join reads it.
          ...(relations?.uploadedBy && r.uploadedBy ? { uploadedBy: speakerRecord(r.uploadedBy.guid) } : {})
        }));
    })
  };

  function speakerRecord(guid: string) {
    const speaker = speakers[guid] as { firstName: string; lastName: string } | undefined;

    return speaker ? { guid, firstName: speaker.firstName, lastName: speaker.lastName } : null;
  }

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
  const remove = (token: string, event: string, file: string) =>
    fetch(`${url}/session-files/link/${token}/${event}/${file}`, { method: 'DELETE' });
  /** The names of the files a speaker's link lists on one of their sessions. */
  const filesOf = async (token: string, event: string) =>
    ((await (await sessions(token)).json()) as Array<{ guid: string; files: Array<{ name: string }> }>)
      .find((s) => s.guid === event)
      .files.map((f) => f.name);
  const kept = () =>
    existsSync(join(appData, 'sessions')) ? readdirSync(join(appData, 'sessions'), { recursive: true }) : [];
  const leftUploading = () => (existsSync(uploadingDirectory()) ? readdirSync(uploadingDirectory()) : []);

  beforeEach(async () => {
    previousAppData = process.env.APP_DATA;
    appData = mkdtempSync(join(tmpdir(), 'gisday-slides-'));
    process.env.APP_DATA = appData;
    rows = [];
    permissions = null;
    vi.clearAllMocks();

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
    // A download's kept-alive connection otherwise holds close() for 3 s, counted against the test that made it.
    app.getHttpServer().closeAllConnections();
    await app.close();
    rmSync(appData, { recursive: true, force: true });
    process.env.APP_DATA = previousAppData;
  });

  describe("the speaker's edit link", () => {
    it('lists the sessions the speaker presents this season, by day, with when and where and no slides yet', async () => {
      const response = await sessions(TOKEN);

      expect(response.status).toBe(200);

      const listed = await response.json();

      expect(listed.map((s) => s.guid)).toEqual([MINE, MINE_TOO, PANEL]);
      expect(listed[0]).toEqual({
        guid: MINE,
        name: 'Mapping Texas watersheds',
        date: '2026-11-18T06:00:00.000Z',
        startTime: '09:30',
        endTime: '10:15',
        place: 'Eller O&M 1003',
        files: [],
        noSlides: false
      });
    });

    // #3147: a panel, a social or lunch has no slides, so its speakers cannot upload any.
    it('says which sessions have no slides, and refuses an upload to one, keeping nothing', async () => {
      const listed = await (await sessions(TOKEN)).json();

      expect(listed.find((s) => s.guid === PANEL).noSlides).toBe(true);

      const response = await upload(TOKEN, PANEL, 'deck.pptx');

      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe('No slides are needed for this session.');
      expect(rows).toEqual([]);
      expect(kept()).toEqual([]);
      expect(leftUploading()).toEqual([]);
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
      expect(rows[0]).toEqual(
        expect.objectContaining({ type: SESSION_FILE_TYPE, event: { guid: MINE }, uploadedBy: { guid: 'speaker-1' } })
      );
      expect(rows[0].path).toBe(`sessions/${MINE}/${rows[0].guid}.pptx`);
      expect(existsSync(join(appData, rows[0].path))).toBe(true);
      expect(leftUploading()).toEqual([]);

      const listed = await (await sessions(TOKEN)).json();

      expect(listed[0].files).toEqual([expect.objectContaining({ name: 'Café watersheds.pptx', size: 2048 })]);
      expect(listed[1].files).toEqual([]);
    });

    it('keeps up to three files a session, each beside the others, and refuses a fourth with the reason', async () => {
      for (const name of ['deck.pptx', 'deck.pdf', 'handout.pdf']) {
        expect((await upload(TOKEN, MINE, name)).status).toBe(201);
      }

      const fourth = await upload(TOKEN, MINE, 'extra.pdf');

      expect(fourth.status).toBe(400);
      expect((await fourth.json()).message).toBe(
        'You can upload up to 3 files for each session. Remove one before adding another.'
      );
      expect(await filesOf(TOKEN, MINE)).toEqual(['deck.pptx', 'deck.pdf', 'handout.pdf']);
      expect(kept().filter((f) => /\.(pdf|pptx)$/.test(String(f)))).toHaveLength(3);
      expect(leftUploading()).toEqual([]);
    });

    it('removes one file, by its id, and leaves the others', async () => {
      await upload(TOKEN, MINE, 'draft.pdf');
      await upload(TOKEN, MINE, 'final.pdf');
      const [draft] = rows;

      expect((await remove(TOKEN, MINE, draft.guid)).status).toBe(204);

      expect(rows.map((r) => r.name)).toEqual(['final.pdf']);
      expect(existsSync(join(appData, draft.path))).toBe(false);
      expect((await remove(TOKEN, MINE, draft.guid)).status).toBe(404);
    });

    it("counts only the speaker's own files: another speaker on the session has three of their own", async () => {
      for (const name of ['a.pdf', 'b.pdf', 'c.pdf']) {
        expect((await upload(OTHER_TOKEN, MINE, name)).status).toBe(201);
      }

      expect((await upload(TOKEN, MINE, 'mine.pdf')).status).toBe(201);
      expect(rows).toHaveLength(4);
    });

    it("lists each speaker only their own files, and another speaker's file cannot be removed (404)", async () => {
      await upload(TOKEN, MINE, 'mine.pdf');
      await upload(OTHER_TOKEN, MINE, 'theirs.pdf');
      const theirs = rows.find((r) => r.name === 'theirs.pdf');

      expect(await filesOf(TOKEN, MINE)).toEqual(['mine.pdf']);
      expect(await filesOf(OTHER_TOKEN, MINE)).toEqual(['theirs.pdf']);

      const response = await remove(TOKEN, MINE, theirs.guid);

      expect(response.status).toBe(404);
      expect(rows.map((r) => r.name)).toEqual(['mine.pdf', 'theirs.pdf']);
      expect(existsSync(join(appData, theirs.path))).toBe(true);
    });

    it("touches only the speaker's own sessions: another's, or last season's, reads as not found, and nothing is kept", async () => {
      for (const event of [NOT_MINE, LAST_YEAR, 'not-a-session']) {
        const response = await upload(TOKEN, event, 'deck.pdf');

        expect(response.status).toBe(404);
      }

      await upload(OTHER_TOKEN, NOT_MINE, 'theirs.pdf');

      expect((await remove(TOKEN, NOT_MINE, rows[0].guid)).status).toBe(404);
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

    // 100 MB and a byte, built and sent to a real local server: 0.4 s alone, but 5.7 s under the full check's load, past
    // Jest's 5 s default, so 30 s, as the repository's other large uploads have.
    it('cuts off a file over the size limit, as a submission file is', async () => {
      const response = await upload(TOKEN, MINE, 'huge.pdf', SUBMISSION_FILE_RULES.maxBytes + 1);

      expect(response.status).toBe(413);
      expect(rows).toEqual([]);
    }, 30_000);

    it('offers the speaker no download, and no admin route through a link', async () => {
      await upload(TOKEN, MINE, 'deck.pdf');

      expect((await fetch(`${url}/session-files/link/${TOKEN}/${MINE}/${rows[0].guid}`)).status).toBe(404);
    });
  });

  describe('the admins', () => {
    beforeEach(async () => {
      await upload(TOKEN, MINE, 'Watersheds.pdf', 3000);
    });

    it("lists every speaker's files on a session, each labelled with who uploaded it", async () => {
      await upload(OTHER_TOKEN, MINE, 'Their deck.pptx');
      as(['update:events']);

      const files = await (await fetch(`${url}/session-files/event/${MINE}`)).json();

      expect(files).toEqual([
        expect.objectContaining({ name: 'Watersheds.pdf', uploadedBy: 'Avery Example' }),
        expect.objectContaining({ name: 'Their deck.pptx', uploadedBy: 'Blair Sample' })
      ]);
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

    /** #3174: every speaker's slides for a session at once, rather than one file at a time. */
    it("downloads every speaker's slides as one zip, a folder per speaker, keeping two files of one name apart", async () => {
      await upload(TOKEN, MINE, 'watersheds.PDF', 10);
      await upload(OTHER_TOKEN, MINE, 'Their deck.pptx', 20);
      // Another session's slides are not in it.
      await upload(TOKEN, MINE_TOO, 'Lightning.pdf');
      as(['update:events']);

      const response = await fetch(`${url}/session-files/event/${MINE}/files.zip`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/zip');
      expect(response.headers.get('content-disposition')).toContain('slides.zip');

      const zip = await JSZip.loadAsync(await response.arrayBuffer());
      const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir);

      expect(names).toEqual([
        'Avery Example/Watersheds.pdf',
        // The second of one name is numbered, as the season's zip numbers it (uniqueName).
        'Avery Example/watersheds (2).pdf',
        'Blair Sample/Their deck.pptx'
      ]);
      expect((await zip.file('Blair Sample/Their deck.pptx').async('nodebuffer')).length).toBe(20);
    });

    it('says so when a session has no slides to zip, and leaves out a file missing from disk', async () => {
      as(['update:events']);

      expect((await fetch(`${url}/session-files/event/${MINE_TOO}/files.zip`)).status).toBe(404);

      await upload(OTHER_TOKEN, MINE, 'Gone.pdf');
      rmSync(join(appData, rows.find((r) => r.name === 'Gone.pdf').path));

      const zip = await JSZip.loadAsync(await (await fetch(`${url}/session-files/event/${MINE}/files.zip`)).arrayBuffer());

      expect(Object.keys(zip.files).filter((n) => !zip.files[n].dir)).toEqual(['Avery Example/Watersheds.pdf']);
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

        for (const path of [`event/${MINE}`, `event/${MINE}/${guid}`, `event/${MINE}/files.zip`, `season/${SEASON}`]) {
          expect((await fetch(`${url}/session-files/${path}`)).status).toBe(403);
        }

        // #3105: nor remove one.
        expect((await fetch(`${url}/session-files/event/${MINE}/${guid}`, { method: 'DELETE' })).status).toBe(403);
      }

      expect(rows).toHaveLength(1);
    });

    /**
     * #3105: a speaker removes only their own files, and the admins' list only downloaded, so a file whose speaker was
     * deleted ("A speaker no longer listed") could not be removed by anyone.
     */
    it("removes any speaker's file from the session, its row and the file itself", async () => {
      await upload(OTHER_TOKEN, MINE, 'Their deck.pptx');
      const theirs = rows.find((r) => r.name === 'Their deck.pptx');
      as(['update:events']);

      const response = await fetch(`${url}/session-files/event/${MINE}/${theirs.guid}`, { method: 'DELETE' });

      expect(response.status).toBe(204);
      expect(rows.map((r) => r.name)).toEqual(['Watersheds.pdf']);
      expect(existsSync(join(appData, theirs.path))).toBe(false);
    });

    it('removes the file of a speaker no longer listed', async () => {
      const file = rows[0];
      // The speaker who uploaded it has since been deleted.
      file.uploadedBy = { guid: '99999999-9999-4999-8999-999999999999' } as Speaker;
      as(['update:events']);

      expect(await (await fetch(`${url}/session-files/event/${MINE}`)).json()).toEqual([
        expect.objectContaining({ name: 'Watersheds.pdf', uploadedBy: 'A speaker no longer listed' })
      ]);

      expect((await fetch(`${url}/session-files/event/${MINE}/${file.guid}`, { method: 'DELETE' })).status).toBe(204);
      expect(rows).toEqual([]);
      expect(existsSync(join(appData, file.path))).toBe(false);
    });

    it("reads another session's file as not found, and removes nothing", async () => {
      const file = rows[0];
      as(['update:events']);

      expect((await fetch(`${url}/session-files/event/${MINE_TOO}/${file.guid}`, { method: 'DELETE' })).status).toBe(404);
      expect(rows).toHaveLength(1);
      expect(existsSync(join(appData, file.path))).toBe(true);
    });
  });
});

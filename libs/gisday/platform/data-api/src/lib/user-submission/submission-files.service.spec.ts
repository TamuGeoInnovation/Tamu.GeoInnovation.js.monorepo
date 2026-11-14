import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';

import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import JSZip from 'jszip';

import { SUBMISSION_FILE_RULES, submissionFileProblem } from '@tamu-gisc/gisday/common';

import { Asset, Submission } from '../entities/all.entity';
import {
  SubmissionFilesService,
  attachment,
  submissionFolder,
  uniqueName,
  uploadingDirectory
} from './submission-files.service';

/**
 * The files students attach to their submissions (#2933). Runs against a real folder standing in for APP_DATA, so a
 * test sees a file moved, kept, streamed and deleted as the API would.
 */
describe('SubmissionFilesService', () => {
  const OWNER = 'auth0|owner';
  const student = { sub: OWNER, permissions: [] };
  const stranger = { sub: 'auth0|someone-else', permissions: [] };
  const admin = { sub: 'auth0|admin', permissions: ['read:competitions', 'update:competitions'] };

  let appData: string;
  let submission: Submission;
  let saved: Array<Asset>;
  let service: SubmissionFilesService;
  let deleteAssetFiles: jest.Mock;
  let previousAppData: string | undefined;

  const submissionRepo = {
    findOne: jest.fn(),
    find: jest.fn()
  };
  const assetRepo = {
    create: jest.fn((a) => a),
    save: jest.fn(async (a) => {
      const row = { ...a, created: new Date() } as Asset;
      saved.push(row);
      submission.files.push(row);
      return row;
    }),
    delete: jest.fn()
  };

  /** A file as Multer leaves it: written under the uploading folder, with the name the browser sent. */
  async function upload(originalname: string, bytes = 1024): Promise<Express.Multer.File> {
    await mkdir(uploadingDirectory(), { recursive: true });
    const path = join(uploadingDirectory(), `${originalname}.part`);
    writeFileSync(path, Buffer.alloc(bytes, 7));

    return { originalname, path, size: bytes } as Express.Multer.File;
  }

  beforeEach(() => {
    previousAppData = process.env.APP_DATA;
    appData = mkdtempSync(join(tmpdir(), 'gisday-files-'));
    process.env.APP_DATA = appData;

    saved = [];
    submission = {
      guid: '11111111-2222-4333-8444-555555555555',
      accountGuid: OWNER,
      title: 'Texas Watersheds',
      submissionType: 'presentation',
      files: []
    } as unknown as Submission;
    submissionRepo.findOne.mockImplementation(async () => submission);
    submissionRepo.find.mockImplementation(async () => [{ ...submission, season: { year: 2026 } }]);
    deleteAssetFiles = jest.fn(async (assets: Array<Asset>) => assets.forEach((a) => rmSync(join(appData, a.path))));

    service = new SubmissionFilesService(submissionRepo as never, assetRepo as never, { deleteAssetFiles } as never);
  });

  afterEach(() => {
    rmSync(appData, { recursive: true, force: true });
    process.env.APP_DATA = previousAppData;
    jest.clearAllMocks();
  });

  describe('add', () => {
    it("moves the student's file into the submission's folder and keeps the name it was uploaded with", async () => {
      const file = await upload('Café results.pptx', 2048);

      const dto = await service.add(submission.guid, student, file);

      expect(dto).toEqual(expect.objectContaining({ name: 'Café results.pptx', size: 2048 }));
      expect(saved[0].path).toBe(`submissions/${submission.guid}/${saved[0].guid}.pptx`);
      expect(saved[0].submission).toBe(submission);
      expect(existsSync(join(appData, saved[0].path))).toBe(true);
      expect(existsSync(file.path)).toBe(false);
    });

    it('refuses a file that is not PowerPoint or PDF, and removes what was uploaded', async () => {
      const file = await upload('notes.docx');

      await expect(service.add(submission.guid, student, file)).rejects.toThrow(BadRequestException);
      expect(saved).toHaveLength(0);
      expect(existsSync(file.path)).toBe(false);
    });

    it(`refuses a file beyond the ${SUBMISSION_FILE_RULES.maxFiles} a submission may have`, async () => {
      for (let i = 1; i <= SUBMISSION_FILE_RULES.maxFiles; i++) {
        await service.add(submission.guid, student, await upload(`deck ${i}.pdf`));
      }

      const extra = await upload('one too many.pdf');

      await expect(service.add(submission.guid, student, extra)).rejects.toThrow(/up to 3 files/);
      expect(saved).toHaveLength(SUBMISSION_FILE_RULES.maxFiles);
      expect(existsSync(extra.path)).toBe(false);
    });

    it("refuses another student's submission as not found, and removes what was uploaded", async () => {
      const file = await upload('deck.pdf');

      await expect(service.add(submission.guid, stranger, file)).rejects.toThrow(NotFoundException);
      expect(saved).toHaveLength(0);
      expect(existsSync(file.path)).toBe(false);
    });

    it('lets an admin who may update the competitions attach a file to any submission', async () => {
      await service.add(submission.guid, admin, await upload('deck.pdf'));

      expect(saved).toHaveLength(1);
    });
  });

  describe('list, download and remove', () => {
    it('lists the files with their sizes, and downloads one under its own name', async () => {
      await service.add(submission.guid, student, await upload('Café results.pptx', 3000));

      const [listed] = await service.list(submission.guid, student);
      const download = await service.download(submission.guid, listed.guid, admin);

      expect(listed).toEqual(expect.objectContaining({ name: 'Café results.pptx', size: 3000 }));
      expect(download.getHeaders()).toEqual(
        expect.objectContaining({
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          length: 3000,
          disposition: `attachment; filename="Caf_ results.pptx"; filename*=UTF-8''Caf%C3%A9%20results.pptx`
        })
      );
    });

    it("does not let another student list or download a submission's files", async () => {
      await service.add(submission.guid, student, await upload('deck.pdf'));

      await expect(service.list(submission.guid, stranger)).rejects.toThrow(NotFoundException);
      await expect(service.download(submission.guid, saved[0].guid, stranger)).rejects.toThrow(NotFoundException);
    });

    it('says a file is missing rather than sending nothing, when its row outlives it', async () => {
      await service.add(submission.guid, student, await upload('deck.pdf'));
      rmSync(join(appData, saved[0].path));

      await expect(service.download(submission.guid, saved[0].guid, admin)).rejects.toThrow(/missing from the server/);
    });

    it('removes the row and the file', async () => {
      await service.add(submission.guid, student, await upload('deck.pdf'));
      const onDisk = join(appData, saved[0].path);

      await service.remove(submission.guid, saved[0].guid, student);

      expect(assetRepo.delete).toHaveBeenCalledWith(saved[0].guid);
      expect(existsSync(onDisk)).toBe(false);
    });
  });

  describe('zipForSeason', () => {
    it("puts every file in a folder per submission, keeping two files' same name apart", async () => {
      await service.add(submission.guid, student, await upload('deck.pdf', 10));
      await service.add(submission.guid, student, await upload('Deck.pdf', 20));

      const zip = await service.zipForSeason('season-guid', admin);
      const contents = await JSZip.loadAsync(await streamToBuffer(zip.getStream()));
      const names = Object.keys(contents.files).filter((n) => !contents.files[n].dir);

      expect(names).toEqual([
        'presentation - Texas Watersheds - 11111111/deck.pdf',
        'presentation - Texas Watersheds - 11111111/Deck (2).pdf'
      ]);
      expect(zip.getHeaders().disposition).toContain('gisday-2026-submission-files.zip');
      expect((await contents.file(names[1]).async('nodebuffer')).length).toBe(20);
    });

    it('is only for those who may read the competitions', async () => {
      await expect(service.zipForSeason('season-guid', student)).rejects.toThrow(ForbiddenException);
    });

    it('says so when no submission has a file', async () => {
      await expect(service.zipForSeason('season-guid', admin)).rejects.toThrow(/No submission in this season/);
    });
  });
});

describe('submission file helpers', () => {
  it('names a folder from the type, a cleaned title and the start of the guid', () => {
    expect(
      submissionFolder({
        guid: 'abcdef12-0000-4000-8000-000000000000',
        title: 'Floods: a/b "study"',
        submissionType: 'poster'
      })
    ).toBe('poster - Floods a b study - abcdef12');
  });

  it('numbers a repeated name, case-insensitively', () => {
    const used = new Set<string>();

    expect(['a.pdf', 'A.pdf', 'a.pdf'].map((n) => uniqueName(n, used))).toEqual(['a.pdf', 'A (2).pdf', 'a (3).pdf']);
  });

  it('keeps an ASCII fallback and the real name in Content-Disposition', () => {
    expect(attachment('résumé "final".pdf')).toBe(
      `attachment; filename="r_sum_ _final_.pdf"; filename*=UTF-8''r%C3%A9sum%C3%A9%20%22final%22.pdf`
    );
  });

  it.each([
    ['slides.PPTX', 1, 0, null],
    ['poster.pdf', SUBMISSION_FILE_RULES.maxBytes, 2, null],
    ['notes.docx', 1, 0, /not a PowerPoint or PDF/],
    ['huge.pdf', SUBMISSION_FILE_RULES.maxBytes + 1, 0, /up to 100 MB/],
    ['empty.pdf', 0, 0, /is empty/],
    ['fourth.pdf', 1, SUBMISSION_FILE_RULES.maxFiles, /up to 3 files/]
  ])('%s, %d bytes, %d already attached', (name, bytes, attached, expected) => {
    const problem = submissionFileProblem(name as string, bytes as number, attached as number);

    if (expected === null) {
      expect(problem).toBeNull();
    } else {
      expect(problem).toMatch(expected as RegExp);
    }
  });
});

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    stream.on('data', (c) => chunks.push(Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

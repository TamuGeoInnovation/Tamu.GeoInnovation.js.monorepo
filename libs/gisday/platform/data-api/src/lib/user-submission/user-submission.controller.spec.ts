import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { UserSubmissionController, guidList } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionFilesService } from './submission-files.service';
import { EMAIL_SENDER_TEST_PROVIDERS } from '../contact/email-sender.testing';

describe('UserSubmissionController posters', () => {
  let app: INestApplication;
  let url: string;
  const getPosters = jest.fn();

  // The real JwtGuard is left in place on purpose: a request with no sign-in must reach the gallery's
  // route, and one that falls through to the guarded ':guid' route answers 401 (#2496).
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserSubmissionController],
      providers: [
        { provide: UserSubmissionProvider, useValue: { getPosters } },
        { provide: SubmissionFilesService, useValue: {} },
        ...EMAIL_SENDER_TEST_PROVIDERS
      ]
    }).compile();

    app = module.createNestApplication({ logger: false });
    await app.listen(0, '127.0.0.1');
    url = await app.getUrl();
  });

  beforeEach(() => {
    getPosters.mockReset();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('answers /user-submissions/posters without a sign-in, for the active season when none is named', async () => {
    const posters = [{ title: 'Flood maps', authors: ['A. Aggie'], link: 'https://example.com/p.pdf', year: 2025 }];
    getPosters.mockResolvedValue(posters);

    const response = await fetch(`${url}/user-submissions/posters`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(posters);
    expect(getPosters).toHaveBeenCalledWith(undefined);
  });

  it('passes the season named in the query to the provider', async () => {
    getPosters.mockResolvedValue([]);
    const season = '7d4f0a54-6a37-4d3e-8c7b-0f4e5c1f6a10';

    const response = await fetch(`${url}/user-submissions/posters?season=${season}`);

    expect(response.status).toBe(200);
    expect(getPosters).toHaveBeenCalledWith(season);
  });

  it('answers 400 for a season that is not a guid, without asking the provider', async () => {
    const response = await fetch(`${url}/user-submissions/posters?season=not-a-guid`);

    expect(response.status).toBe(400);
    expect(getPosters).not.toHaveBeenCalled();
  });
});

/**
 * #2958: approving or rejecting the selected submissions is one request. Nest's real routing, body parsing and
 * `PermissionsGuard` run; only the token check is replaced, by a signed-in admin whose permissions each test chooses.
 */
describe('UserSubmissionController POST /user-submissions/review', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const reviewUserSubmissions = jest.fn();
  const updateUserSubmission = jest.fn();

  const post = (body: object, headers: Record<string, string> = {}) =>
    fetch(`${url}/user-submissions/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    reviewUserSubmissions.mockReset().mockResolvedValue({ reviewed: ['Flood maps'], failed: [] });
    updateUserSubmission.mockReset();

    const module = await Test.createTestingModule({
      controllers: [UserSubmissionController],
      providers: [
        { provide: UserSubmissionProvider, useValue: { reviewUserSubmissions, updateUserSubmission } },
        { provide: SubmissionFilesService, useValue: {} },
        ...EMAIL_SENDER_TEST_PROVIDERS
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
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
  });

  it('refuses an admin without update:competitions', async () => {
    permissions = ['read:competitions'];

    const response = await post({ submissions: ['a'], acceptance: true });

    expect(response.status).toBe(403);
    expect(reviewUserSubmissions).not.toHaveBeenCalled();
  });

  it("reviews the list in one call, as the signed-in reviewer, from the reviewer's site", async () => {
    permissions = ['update:competitions'];

    const response = await post(
      { submissions: ['a', 'b'], acceptance: false, message: 'Thank you.' },
      { Origin: 'https://gisday.tamu.edu' }
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ reviewed: ['Flood maps'], failed: [] });
    expect(reviewUserSubmissions).toHaveBeenCalledTimes(1);
    expect(reviewUserSubmissions).toHaveBeenCalledWith(
      ['a', 'b'],
      'admin-1',
      { acceptance: false, message: 'Thank you.' },
      ['update:competitions'],
      'gisday.tamu.edu'
    );
    // Not the single review's route, taking "review" for a submission's guid.
    expect(updateUserSubmission).not.toHaveBeenCalled();
  });
});

/** #3017: the final reminder's two routes, beside the review's, for reviewers only. */
describe('UserSubmissionController POST /user-submissions/remind', () => {
  let app: INestApplication;
  let url: string;
  let permissions: Array<string>;
  const remindUserSubmissions = jest.fn();
  const previewReminders = jest.fn();
  const updateUserSubmission = jest.fn();

  const post = (path: string, body: object) =>
    fetch(`${url}/user-submissions/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'https://gisday.tamu.edu' },
      body: JSON.stringify(body)
    });

  beforeEach(async () => {
    permissions = [];
    remindUserSubmissions.mockReset().mockResolvedValue({ sent: ['Flood maps'], skipped: [], failed: [] });
    previewReminders.mockReset().mockResolvedValue({ groups: [], skipped: [] });
    updateUserSubmission.mockReset();

    const module = await Test.createTestingModule({
      controllers: [UserSubmissionController],
      providers: [
        { provide: UserSubmissionProvider, useValue: { remindUserSubmissions, previewReminders, updateUserSubmission } },
        { provide: SubmissionFilesService, useValue: {} },
        ...EMAIL_SENDER_TEST_PROVIDERS
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
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
  });

  it('refuses an admin without update:competitions, on both routes', async () => {
    permissions = ['read:competitions'];

    expect((await post('remind', { submissions: ['a'] })).status).toBe(403);
    expect((await post('remind/preview', { submissions: ['a'] })).status).toBe(403);
    expect(remindUserSubmissions).not.toHaveBeenCalled();
    expect(previewReminders).not.toHaveBeenCalled();
  });

  it("previews and sends the list in one call each, from the reviewer's site, with the text approved", async () => {
    permissions = ['update:competitions'];
    const templates = { 'poster-reminder': 'Hi {first name}' };

    expect((await post('remind/preview', { submissions: ['a', 'b'] })).status).toBe(201);
    expect(previewReminders).toHaveBeenCalledWith(['a', 'b'], ['update:competitions'], 'gisday.tamu.edu');

    const response = await post('remind', { submissions: ['a', 'b'], templates });

    expect(await response.json()).toEqual({ sent: ['Flood maps'], skipped: [], failed: [] });
    expect(remindUserSubmissions).toHaveBeenCalledWith(
      ['a', 'b'],
      { templates },
      ['update:competitions'],
      'gisday.tamu.edu'
    );
    expect(updateUserSubmission).not.toHaveBeenCalled();
  });
});

/** #3174: the submissions a season's zip is narrowed to, from `?submissions=`. */
describe('guidList', () => {
  const a = '11111111-2222-4333-8444-555555555555';
  const b = '99999999-8888-4777-8666-555555555555';

  it('reads a comma-separated list, spaces and empty entries aside', () => {
    expect(guidList(` ${a}, ${b},`)).toEqual([a, b]);
  });

  it('is nothing when nothing is named, so the whole season is zipped', () => {
    expect(guidList(undefined)).toBeUndefined();
    expect(guidList('')).toBeUndefined();
  });

  it('refuses a list with anything but ids in it', () => {
    expect(() => guidList(`${a},../../etc`)).toThrow(/comma-separated list of ids/);
  });
});

/**
 * #3090: a submission's file previewed in the admin, an admin's route only. The download route lets a submission's owner
 * read their own files; the preview does not, so a student who owns the submission is refused like anyone without
 * read:competitions. Nest's real routing and `PermissionsGuard` run; only the token check is replaced.
 */
describe('UserSubmissionController GET /user-submissions/:guid/files/:file/preview', () => {
  const SUBMISSION = '11111111-2222-4333-8444-555555555555';
  const FILE = '99999999-8888-4777-8666-555555555555';

  let app: INestApplication;
  let url: string;
  let user: { sub: string; permissions: Array<string> };
  const preview = jest.fn();

  beforeEach(async () => {
    preview.mockReset().mockResolvedValue({ seen: true });

    const module = await Test.createTestingModule({
      controllers: [UserSubmissionController],
      providers: [
        { provide: UserSubmissionProvider, useValue: {} },
        { provide: SubmissionFilesService, useValue: { preview } },
        ...EMAIL_SENDER_TEST_PROVIDERS
      ]
    })
      .overrideGuard(JwtGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = user;
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
  });

  const get = () => fetch(`${url}/user-submissions/${SUBMISSION}/files/${FILE}/preview`);

  it("refuses the submission's own student, who may still download it", async () => {
    user = { sub: 'auth0|owner', permissions: [] };

    expect((await get()).status).toBe(403);
    expect(preview).not.toHaveBeenCalled();
  });

  it('refuses an admin without read:competitions', async () => {
    user = { sub: 'auth0|admin', permissions: ['update:events'] };

    expect((await get()).status).toBe(403);
    expect(preview).not.toHaveBeenCalled();
  });

  it('previews for an admin who may read the competitions, that submission and that file only', async () => {
    user = { sub: 'auth0|admin', permissions: ['read:competitions'] };

    expect((await get()).status).toBe(200);
    expect(preview).toHaveBeenCalledWith(SUBMISSION, FILE, user);
  });
});

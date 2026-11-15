import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { JwtGuard } from '@tamu-gisc/common/nest/auth';

import { UserSubmissionController } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';
import { SubmissionFilesService } from './submission-files.service';

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
        { provide: SubmissionFilesService, useValue: {} }
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
        { provide: SubmissionFilesService, useValue: {} }
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

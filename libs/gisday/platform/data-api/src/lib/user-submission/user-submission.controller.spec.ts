import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { UserSubmissionController } from './user-submission.controller';
import { UserSubmissionProvider } from './user-submission.provider';

describe('UserSubmissionController posters', () => {
  let app: INestApplication;
  let url: string;
  const getPosters = jest.fn();

  // The real JwtGuard is left in place on purpose: a request with no sign-in must reach the gallery's
  // route, and one that falls through to the guarded ':guid' route answers 401 (#2496).
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserSubmissionController],
      providers: [{ provide: UserSubmissionProvider, useValue: { getPosters } }]
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

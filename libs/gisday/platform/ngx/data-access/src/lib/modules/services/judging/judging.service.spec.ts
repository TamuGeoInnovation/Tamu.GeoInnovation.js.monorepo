import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { DEFAULT_RUBRICS } from '@tamu-gisc/gisday/common';

import { JudgingService } from './judging.service';

/** #3183: the judging routes, as the site calls them. */
describe('JudgingService (#3183)', () => {
  let service: JudgingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(JudgingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("reads and saves through the judge's own link, with no sign-in", async () => {
    const page = firstValueFrom(service.forLink('a/b'));
    http.expectOne('api/judging/link/a%2Fb').flush({ competitions: [] });
    await expect(page).resolves.toEqual({ competitions: [] });

    const saved = firstValueFrom(service.assess('tok', 's-1', { scores: { 'c-1': 5 }, comment: 'Good.' }));
    const request = http.expectOne('api/judging/link/tok/s-1');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ scores: { 'c-1': 5 }, comment: 'Good.' });
    request.flush({ total: 5 });
    await expect(saved).resolves.toEqual({ total: 5 });
  });

  it("reads and changes a season's rubrics", async () => {
    const list = firstValueFrom(service.rubrics('season-1'));
    http.expectOne('api/rubrics/season/season-1').flush([]);
    await expect(list).resolves.toEqual([]);

    const created = firstValueFrom(service.createRubric('season-1', DEFAULT_RUBRICS.poster));
    const post = http.expectOne('api/rubrics');

    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(expect.objectContaining({ season: 'season-1', competitionType: 'poster' }));
    post.flush({});
    await created;

    const updated = firstValueFrom(service.updateRubric('r-1', { name: 'N', description: null, criteria: [] }));
    const put = http.expectOne('api/rubrics/r-1');

    expect(put.request.method).toBe('PUT');
    put.flush({});
    await updated;
  });

  it("reads a competition's results, and a session's judges", async () => {
    const results = firstValueFrom(service.results('season-1', 'graduate-poster'));
    http.expectOne('api/judging/results?season=season-1&competition=graduate-poster').flush({ rows: [] });
    await expect(results).resolves.toEqual({ rows: [] });

    const judging = firstValueFrom(service.eventJudging('e-1'));
    http.expectOne('api/events/e-1/judging').flush({ judges: ['s-1'] });
    await expect(judging).resolves.toEqual({ judges: ['s-1'] });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { UserSubmissionsService, reviewSubmissionsToast } from './user-submissions.service';

/** #2958: approving or rejecting the selected submissions is one request for the whole selection. */
describe('UserSubmissionsService.review()', () => {
  let service: UserSubmissionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: EnvironmentService, useValue: { value: () => 'api' } }]
    });

    service = TestBed.inject(UserSubmissionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the selection and the decision once', async () => {
    const result = firstValueFrom(service.review(['a', 'b'], true));
    const request = http.expectOne('api/user-submissions/review');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ submissions: ['a', 'b'], acceptance: true });

    request.flush({ reviewed: ['A', 'B'], failed: [] });

    await expect(result).resolves.toEqual({ reviewed: ['A', 'B'], failed: [] });
  });
});

/** #2958: the result says how many were done and lists any that failed, by title. */
describe('reviewSubmissionsToast', () => {
  it('says how many were approved and that each submitter was emailed', () => {
    expect(reviewSubmissionsToast({ reviewed: ['A', 'B'], failed: [] }, true)).toEqual({
      id: 'submission-review',
      title: 'Submissions approved',
      message: 'Approved 2 submissions and emailed their submitters.'
    });
  });

  it('names one by its title', () => {
    expect(reviewSubmissionsToast({ reviewed: ['Flood maps'], failed: [] }, false).message).toBe(
      'Rejected "Flood maps" and emailed its submitter.'
    );
  });

  it('lists each that failed, by title, with why', () => {
    const toast = reviewSubmissionsToast(
      {
        reviewed: ['A', 'Flood maps'],
        failed: [
          { title: 'Flood maps', reason: 'reviewed, but the email could not be sent' },
          { title: 'Trees', reason: 'it no longer exists' }
        ]
      },
      true
    );

    expect(toast.title).toBe('Some submissions were not approved or emailed');
    expect(toast.message).toBe(
      'Approved 2 submissions and emailed their submitters. Problems - Flood maps: reviewed, but the email could not be sent; Trees: it no longer exists.'
    );
  });
});

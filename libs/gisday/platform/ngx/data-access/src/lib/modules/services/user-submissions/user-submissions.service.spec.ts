import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { UserSubmissionsService, finalRemindersToast, reviewSubmissionsToast } from './user-submissions.service';

/** #2958: approving or rejecting the selected submissions is one request for the whole selection. */
describe('UserSubmissionsService.review()', () => {
  let service: UserSubmissionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
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

  // #3100: the sender chosen in the window comes back beside the texts, and goes to the API on its own, to be checked.
  it('sends the sender chosen in the window as `sender`, not as a text', () => {
    service.review(['a'], true, undefined, { poster: 'Hi', ':sender': 'jadmin@tamu.edu' }).subscribe();
    const request = http.expectOne('api/user-submissions/review');

    expect(request.request.body).toEqual({
      submissions: ['a'],
      acceptance: true,
      templates: { poster: 'Hi' },
      sender: 'jadmin@tamu.edu'
    });
    request.flush({ reviewed: [], failed: [] });
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
      'Approved 2 submissions. Problems - Flood maps: reviewed, but the email could not be sent; Trees: it no longer exists.'
    );
  });
});

/** #3017: the final reminder, previewed and sent by the review's own kind of request. */
describe('UserSubmissionsService, the final reminder', () => {
  let service: UserSubmissionsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(UserSubmissionsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews and then sends the selection once each, with the text approved', () => {
    service.previewReminders(['a', 'b']).subscribe();
    const preview = http.expectOne({ method: 'POST', url: 'api/user-submissions/remind/preview' });

    expect(preview.request.body).toEqual({ submissions: ['a', 'b'] });
    preview.flush({ groups: [], skipped: [] });

    service.remind(['a', 'b'], { 'poster-reminder': 'Hi' }).subscribe();
    const send = http.expectOne({ method: 'POST', url: 'api/user-submissions/remind' });

    expect(send.request.body).toEqual({ submissions: ['a', 'b'], templates: { 'poster-reminder': 'Hi' } });
    send.flush({ sent: [], skipped: [], failed: [] });
  });

  // #3100: the sender chosen in the window goes to the API as `sender`, to be checked there.
  it('sends the sender chosen in the window as `sender`, not as a text', () => {
    service.remind(['a'], { 'poster-reminder': 'Hi', ':sender': 'jadmin@tamu.edu' }).subscribe();
    const send = http.expectOne({ method: 'POST', url: 'api/user-submissions/remind' });

    expect(send.request.body).toEqual({
      submissions: ['a'],
      templates: { 'poster-reminder': 'Hi' },
      sender: 'jadmin@tamu.edu'
    });
    send.flush({ sent: [], skipped: [], failed: [] });
  });
});

describe('finalRemindersToast', () => {
  it('says how many were reminded, and how many were skipped for already having a file', () => {
    expect(
      finalRemindersToast({ sent: ['A', 'B'], skipped: [{ title: 'C', reason: 'already has a file' }], failed: [] })
    ).toEqual({
      id: 'final-reminder',
      title: 'Final reminders sent',
      message: 'Reminded 2 submissions. Skipped 1 that already has a file.'
    });
  });

  it('says why each group was skipped: a file already, or not accepted', () => {
    const skipped = [
      { title: 'C', reason: 'already has a file' as const },
      { title: 'D', reason: 'not accepted' as const },
      { title: 'E', reason: 'not accepted' as const }
    ];

    expect(finalRemindersToast({ sent: [], skipped, failed: [] }).message).toBe(
      'None were reminded. Skipped 1 that already has a file and 2 that were not accepted.'
    );
  });

  it('names one by its title, and lists each that failed, with why', () => {
    const toast = finalRemindersToast({
      sent: ['Flood maps'],
      skipped: [],
      failed: [{ title: 'Bike lanes', reason: 'the email could not be sent' }]
    });

    expect(toast.title).toBe('Some final reminders were not sent');
    expect(toast.message).toBe('Reminded "Flood maps". Problems - Bike lanes: the email could not be sent.');
  });
});

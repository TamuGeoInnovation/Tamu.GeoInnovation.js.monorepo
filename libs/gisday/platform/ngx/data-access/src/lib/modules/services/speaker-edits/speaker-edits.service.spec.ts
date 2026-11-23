import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import {
  SpeakerEditsService,
  sendEditLinksToast,
  sendJudgingToast,
  sendSessionDetailsToast,
  sendSlidesRequestToast
} from './speaker-edits.service';

/** #2958: profile emails for the selected submissions' people, in one request. */
describe('SpeakerEditsService.sendForSubmissions()', () => {
  let service: SpeakerEditsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SpeakerEditsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the selected submissions once', async () => {
    const result = firstValueFrom(service.sendForSubmissions(['a', 'b']));
    const request = http.expectOne('api/speaker-edits/send-for-submissions');

    expect(request.request.body).toEqual({ submissions: ['a', 'b'] });

    request.flush({ sent: [], skipped: [], unmatched: [] });

    await expect(result).resolves.toEqual({ sent: [], skipped: [], unmatched: [] });
  });
});

describe('sendEditLinksToast', () => {
  it('reads as before for the Speakers list', () => {
    expect(sendEditLinksToast({ sent: ['Ana Ruiz'], skipped: [] })).toEqual({
      id: 'speaker-edit-links',
      title: 'Profile emails sent',
      message: 'Sent to Ana Ruiz.'
    });
  });

  // #2958: a participant with no speaker record is listed, so the admin can add them.
  it('names each participant with no speaker record, with their submission', () => {
    expect(
      sendEditLinksToast({
        sent: ['Ana Ruiz', 'Cy Diaz'],
        skipped: [],
        unmatched: [
          { name: 'Ben Lee', submission: 'Flood maps' },
          { name: 'Dee Fox', submission: 'Campus trees' }
        ]
      })
    ).toEqual({
      id: 'speaker-edit-links',
      title: 'Some profile emails were not sent',
      message: 'Sent to 2 speakers. No speaker record - Ben Lee (Flood maps); Dee Fox (Campus trees).'
    });
  });
});

/** #3023: the profile email is previewed first, and sent as edited, from the Speakers list, an event or Research Competitions. */
describe('SpeakerEditsService, the email read and edited first', () => {
  let service: SpeakerEditsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SpeakerEditsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews for speakers or for submissions, and sends the subject and text as edited', () => {
    const email = { subject: 'Profile', template: 'Hi {edit link}' };

    service.preview(['sp-1']).subscribe();
    expect(http.expectOne({ method: 'POST', url: 'api/speaker-edits/send/preview' }).request.body).toEqual({
      speakers: ['sp-1']
    });

    service.previewForSubmissions(['sub-1']).subscribe();
    expect(http.expectOne({ method: 'POST', url: 'api/speaker-edits/send-for-submissions/preview' }).request.body).toEqual({
      submissions: ['sub-1']
    });

    service.send(['sp-1'], email).subscribe();
    expect(http.expectOne({ method: 'POST', url: 'api/speaker-edits/send' }).request.body).toEqual({
      speakers: ['sp-1'],
      ...email
    });

    service.sendForSubmissions(['sub-1'], email).subscribe();
    expect(http.expectOne({ method: 'POST', url: 'api/speaker-edits/send-for-submissions' }).request.body).toEqual({
      submissions: ['sub-1'],
      ...email
    });
  });
});

/** #3092: a session's speakers emailed its details, previewed first, by the session's id. */
describe('SpeakerEditsService, the session details email', () => {
  let service: SpeakerEditsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SpeakerEditsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews the email for the session', async () => {
    const preview = firstValueFrom(service.previewSessionDetails('e-1'));
    const request = http.expectOne('api/session-emails/details/preview');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ event: 'e-1' });

    request.flush({ groups: [] });

    await expect(preview).resolves.toEqual({ groups: [] });
  });

  it('sends it as edited', async () => {
    const result = firstValueFrom(service.sendSessionDetails('e-1', { subject: 'S', template: 'T' }));
    const request = http.expectOne('api/session-emails/details');

    expect(request.request.body).toEqual({ event: 'e-1', subject: 'S', template: 'T' });

    request.flush({ sent: ['Ana Ruiz'], skipped: [] });

    await expect(result).resolves.toEqual({ sent: ['Ana Ruiz'], skipped: [] });
  });

  // #3104: the speakers ticked in the window, and together, go with it.
  it('sends it to the speakers ticked, together when chosen', () => {
    service
      .sendSessionDetails('e-1', { subject: 'S', template: 'T', speakers: ['sp-1', 'sp-2'], together: true })
      .subscribe();

    expect(http.expectOne('api/session-emails/details').request.body).toEqual({
      event: 'e-1',
      subject: 'S',
      template: 'T',
      speakers: ['sp-1', 'sp-2'],
      together: true
    });
  });

  // #3104: the profile email goes to the speakers ticked, of those the page named.
  it('sends the profile email to the speakers ticked rather than every one the page named', () => {
    service.send(['sp-1', 'sp-2', 'sp-3'], { subject: 'S', template: 'T {edit link}', speakers: ['sp-2'] }).subscribe();

    expect(http.expectOne('api/speaker-edits/send').request.body).toEqual({
      speakers: ['sp-2'],
      subject: 'S',
      template: 'T {edit link}'
    });
  });
});

describe('sendSessionDetailsToast', () => {
  it('says who got the details, and who did not and why', () => {
    expect(sendSessionDetailsToast({ sent: ['Ana Ruiz'], skipped: [] })).toEqual({
      id: 'session-details-email',
      title: 'Session details sent',
      message: 'Sent to Ana Ruiz.'
    });
    expect(
      sendSessionDetailsToast({
        sent: ['Ana Ruiz', 'Cy Diaz'],
        skipped: [{ name: 'Dee Fox', reason: 'no email address on their record' }]
      })
    ).toEqual({
      id: 'session-details-email',
      title: 'Some session details emails were not sent',
      message: 'Sent to 2 speakers. Not sent - Dee Fox: no email address on their record.'
    });
  });
});

/** #3113: the Ask for slides email's routes, beside the session details email's. */
describe('SpeakerEditsService, the Ask for slides email', () => {
  let service: SpeakerEditsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SpeakerEditsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews it for the session', async () => {
    const preview = firstValueFrom(service.previewSlidesRequest('e-1'));
    const request = http.expectOne('api/session-emails/slides/preview');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ event: 'e-1' });

    request.flush({ groups: [] });

    await expect(preview).resolves.toEqual({ groups: [] });
  });

  it('sends it as edited, to the speakers ticked, as the sender chosen', async () => {
    const result = firstValueFrom(
      service.sendSlidesRequest('e-1', {
        subject: 'S',
        template: 'T {edit link}',
        sender: 'jadmin@tamu.edu',
        speakers: ['sp-2']
      })
    );
    const request = http.expectOne('api/session-emails/slides');

    expect(request.request.body).toEqual({
      event: 'e-1',
      subject: 'S',
      template: 'T {edit link}',
      sender: 'jadmin@tamu.edu',
      speakers: ['sp-2']
    });

    request.flush({ sent: ['Blair Sample'], skipped: [] });

    await expect(result).resolves.toEqual({ sent: ['Blair Sample'], skipped: [] });
  });
});

describe('sendSlidesRequestToast', () => {
  it('says who was asked, and who was not and why', () => {
    expect(sendSlidesRequestToast({ sent: ['Avery Example'], skipped: [] })).toEqual({
      id: 'slides-request-email',
      title: 'Slides requested',
      message: 'Sent to Avery Example.'
    });
    expect(
      sendSlidesRequestToast({
        sent: [],
        skipped: [{ name: 'Blair Sample', reason: "already asked for this session's slides in the last 10 minutes" }]
      })
    ).toEqual({
      id: 'slides-request-email',
      title: 'Some slides requests were not sent',
      message: "None were sent. Not sent - Blair Sample: already asked for this session's slides in the last 10 minutes."
    });
  });
});

/** #3183: the Ask to judge email's routes, beside the other session emails'. */
describe('SpeakerEditsService, the Ask to judge email', () => {
  let service: SpeakerEditsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } }
      ]
    });

    service = TestBed.inject(SpeakerEditsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('previews it for the session, and sends it as edited to the judges ticked', async () => {
    const preview = firstValueFrom(service.previewJudging('e-1'));
    const previewRequest = http.expectOne('api/session-emails/judging/preview');

    expect(previewRequest.request.body).toEqual({ event: 'e-1' });
    previewRequest.flush({ groups: [] });
    await expect(preview).resolves.toEqual({ groups: [] });

    const result = firstValueFrom(
      service.sendJudging('e-1', { subject: 'S', template: 'T {judging link}', speakers: ['sp-2'] })
    );
    const request = http.expectOne('api/session-emails/judging');

    expect(request.request.body).toEqual({ event: 'e-1', subject: 'S', template: 'T {judging link}', speakers: ['sp-2'] });
    request.flush({ sent: ['Dana Judge'], skipped: [] });
    await expect(result).resolves.toEqual({ sent: ['Dana Judge'], skipped: [] });
  });
});

describe('sendJudgingToast (#3183)', () => {
  it('says who was asked, and who was not and why', () => {
    expect(sendJudgingToast({ sent: ['Dana Judge'], skipped: [] })).toEqual({
      id: 'judging-email',
      title: 'Judges asked',
      message: 'Sent to Dana Judge.'
    });
    expect(
      sendJudgingToast({ sent: [], skipped: [{ name: 'Emery Judge', reason: 'the email could not be sent' }] })
    ).toEqual({
      id: 'judging-email',
      title: 'Some judges were not asked',
      message: 'None were sent. Not sent - Emery Judge: the email could not be sent.'
    });
  });
});

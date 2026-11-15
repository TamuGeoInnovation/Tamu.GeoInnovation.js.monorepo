import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { SpeakerEditsService, sendEditLinksToast } from './speaker-edits.service';

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

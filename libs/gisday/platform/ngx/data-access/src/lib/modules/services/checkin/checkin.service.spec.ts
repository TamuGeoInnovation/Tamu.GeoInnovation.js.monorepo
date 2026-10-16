import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { CheckinService } from './checkin.service';

describe('CheckinService', () => {
  let service: CheckinService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EnvironmentService, useValue: { value: () => 'api' } },
        { provide: NotificationService, useValue: { toast: jest.fn() } }
      ]
    });

    service = TestBed.inject(CheckinService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  /**
   * Regression coverage (#1767). The admin page's Check-ins > Add posted the attendee and the event to
   * the attendee endpoint, which checks in whoever is signed in, so it checked in the admin.
   */
  it("sends the admin page's new check-in to the admin endpoint, with the attendee", () => {
    // What the page submits: its untyped form's value.
    const form = new UntypedFormGroup({
      guid: new UntypedFormControl(''),
      userGuid: new UntypedFormControl('attendee-1'),
      eventGuid: new UntypedFormControl('event-1')
    });

    service.createEntity(form.value).subscribe();

    const request = http.expectOne('api/check-ins/admin');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ guid: '', userGuid: 'attendee-1', eventGuid: 'event-1' });
    request.flush({});
  });
});

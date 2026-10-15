import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { SubmissionComponent, submissionFailureMessage } from './submission.component';

/**
 * #1784: the form keeps looking for a location until it has one, shows where it stands, and says why
 * a submission was not sent instead of showing only "Error!".
 */
describe('SubmissionComponent', () => {
  let watchers: Array<{ ok: (p: unknown) => void; fail: (e: unknown) => void }>;
  let toast: jest.Mock;
  let preset: jest.Mock;
  let postSubmission: jest.Mock;

  const formModel = {
    allowSubmissions: true,
    season: { guid: 'cs-1' },
    form: {
      model: [{ attribute: 'kind', title: 'Kind', instructions: '', type: 'select', enabled: true, options: [{ name: 'Monument', value: 'monument' }] }]
    }
  };

  const position = (accuracy = 12) => ({
    coords: { latitude: 30.6122, longitude: -96.3414, accuracy, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
    timestamp: 1
  });

  const create = () => {
    const fixture = TestBed.createComponent(SubmissionComponent);
    fixture.componentRef.setInput('formModel', formModel);
    fixture.detectChanges();

    return fixture;
  };

  /**
   * Fills in the form so that only the location can stop it being sent.
   */
  const complete = (component: SubmissionComponent) => {
    component.form.get('fields').get('0').get('value').setValue('monument');
    component.file.next(new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }));
  };

  beforeEach(() => {
    watchers = [];
    (navigator as unknown as { geolocation: unknown }).geolocation = {
      watchPosition: jest.fn((ok, fail) => watchers.push({ ok, fail }) - 1),
      clearWatch: jest.fn()
    };

    toast = jest.fn();
    preset = jest.fn();
    postSubmission = jest.fn(() => of({ type: HttpEventType.Response }));

    TestBed.configureTestingModule({
      imports: [SubmissionComponent],
      providers: [
        { provide: NotificationService, useValue: { toast, preset } },
        { provide: Angulartics2, useValue: { eventTrack: { next: jest.fn() } } },
        { provide: SubmissionService, useValue: { postSubmission } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    });
  });

  it('shows that it is finding the location, then how accurate it is', () => {
    const fixture = create();

    expect(fixture.nativeElement.textContent).toContain('Finding your location');

    watchers[0].ok(position(12.4));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Location found, accurate to about 12 m.');
  });

  it('keeps looking after a timeout, instead of giving up for good', fakeAsync(() => {
    const fixture = create();

    watchers[0].fail({ code: 3 });
    tick(2000);
    fixture.detectChanges();

    expect(watchers.length).toBe(2);
    expect(fixture.componentInstance.locationStatus.getValue()).toBe('finding');

    watchers[1].ok(position());
    expect(fixture.componentInstance.locationStatus.getValue()).toBe('found');

    fixture.destroy();
  }));

  it('stops and says so when location access is refused', fakeAsync(() => {
    const fixture = create();

    watchers[0].fail({ code: 1 });
    tick(5000);
    fixture.detectChanges();

    expect(watchers.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Location access is blocked');
    expect(preset).toHaveBeenCalledWith('no_gps');
  }));

  it('does not send a submission without a location, and says it is still finding it', () => {
    const fixture = create();
    complete(fixture.componentInstance);

    expect(() => fixture.componentInstance.submitResponse()).not.toThrow();
    expect(postSubmission).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('still finding your location') }));
  });

  it('does not send a submission when location is blocked, and says how to allow it', () => {
    const fixture = create();
    watchers[0].fail({ code: 1 });
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();

    expect(postSubmission).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Location access is blocked') }));
  });

  it('sends the submission with the location and its accuracy, and no account id', () => {
    const fixture = create();
    watchers[0].ok(position(8));
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();

    expect(postSubmission).toHaveBeenCalledTimes(1);
    const data: FormData = postSubmission.mock.calls[0][0];
    expect(JSON.parse(data.get('location') as string)).toMatchObject({ latitude: 30.6122, longitude: -96.3414, accuracy: 8 });
    expect(data.has('userGuid')).toBe(false);
  });

  it('says why a failed upload was not saved and offers to try again', () => {
    postSubmission.mockReturnValue(throwError(() => ({ status: 422, error: { message: 'Competition season not found.' } })));
    const fixture = create();
    watchers[0].ok(position());
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();
    fixture.detectChanges();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Competition season not found. Press Try Again to resend it.' }));
    expect(fixture.nativeElement.textContent).toContain('Try Again');
    expect(fixture.nativeElement.textContent).not.toContain('Error!');
  });
});

describe('submissionFailureMessage', () => {
  it('blames the connection when the request never reached the server', () => {
    expect(submissionFailureMessage({ status: 0 })).toContain('did not reach the server');
    expect(submissionFailureMessage(undefined)).toContain('did not reach the server');
  });

  it('asks a signed-out participant to sign in again', () => {
    expect(submissionFailureMessage({ status: 401, error: { message: 'Unauthorized' } })).toBe(
      'You have been signed out. Sign in again, then press Try Again.'
    );
  });

  it("passes on the server's reason, joined when it is a list", () => {
    expect(submissionFailureMessage({ status: 400, error: { message: ['A.', 'B.'] } })).toBe('A. B. Press Try Again to resend it.');
  });

  it('has a general message when the server gave none', () => {
    expect(submissionFailureMessage({ status: 500, error: {} })).toBe('The server could not save it. Press Try Again to resend it.');
  });
});

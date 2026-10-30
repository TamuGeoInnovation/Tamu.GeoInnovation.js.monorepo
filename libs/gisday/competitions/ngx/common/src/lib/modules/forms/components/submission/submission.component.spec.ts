import { TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType } from '@angular/common/http';
import { defer, of, throwError } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import { SubmissionComponent, submissionFailureMessage, uploadMayBeRetried } from './submission.component';

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
   * Lets the photographs be shrunk, which happens asynchronously, before the upload starts (#1786).
   */
  const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

  /**
   * Fills in the form so that only the location can stop it being sent.
   */
  const complete = (component: SubmissionComponent) => {
    component.form.get('fields').get('0').get('value').setValue('monument');
    component.file.next(new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }));
  };

  beforeEach(() => {
    // jsdom may not have crypto.randomUUID, which a phone's browser does.
    if (typeof globalThis.crypto?.randomUUID !== 'function') {
      Object.defineProperty(globalThis, 'crypto', { value: jest.requireActual('crypto').webcrypto, configurable: true });
    }

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

  it('keeps looking after a timeout, instead of giving up for good', () => {
    const fixture = create();

    watchers[0].fail({ code: 3 });
    fixture.detectChanges();

    expect(navigator.geolocation.clearWatch).not.toHaveBeenCalled();
    expect(fixture.componentInstance.locationStatus.getValue()).toBe('finding');

    watchers[0].ok(position());
    expect(fixture.componentInstance.locationStatus.getValue()).toBe('found');

    fixture.destroy();
  });

  it('after a few failed attempts, says to check that Location is on', () => {
    const fixture = create();
    complete(fixture.componentInstance);

    watchers[0].fail({ code: 2 });
    watchers[0].fail({ code: 3 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Make sure Location is on');

    watchers[0].fail({ code: 2 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Make sure Location is on in your phone's settings");

    fixture.componentInstance.submitResponse();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Make sure Location is on') }));
    expect(postSubmission).not.toHaveBeenCalled();
  });

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

  it('starts looking again when Submit is pressed while blocked, so allowing access then submitting works', async () => {
    const fixture = create();
    watchers[0].fail({ code: 1 });
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();

    expect(watchers.length).toBe(2);
    expect(fixture.componentInstance.locationStatus.getValue()).toBe('finding');

    watchers[1].ok(position());
    fixture.componentInstance.submitResponse();
    await settle();

    expect(postSubmission).toHaveBeenCalledTimes(1);
  });

  it('sends the submission with the location and its accuracy, and no account id', async () => {
    const fixture = create();
    watchers[0].ok(position(8));
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();
    await settle();

    expect(postSubmission).toHaveBeenCalledTimes(1);
    const data: FormData = postSubmission.mock.calls[0][0];
    expect(JSON.parse(data.get('location') as string)).toMatchObject({ latitude: 30.6122, longitude: -96.3414, accuracy: 8 });
    expect(data.has('userGuid')).toBe(false);
  });

  it('goes to the confirmation page after a saved submission, with no failure message', async () => {
    const fixture = create();
    const router = TestBed.inject(Router);
    watchers[0].ok(position());
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();
    await settle();

    expect(router.navigate).toHaveBeenCalledWith(['complete'], expect.anything());
    expect(toast).not.toHaveBeenCalled();
    expect(fixture.componentInstance.submissionStatus.getValue()).not.toBe(-1);
  });

  it('says why a failed upload was not saved and offers to try again', async () => {
    postSubmission.mockReturnValue(throwError(() => ({ status: 422, error: { message: 'Competition season not found.' } })));
    const fixture = create();
    watchers[0].ok(position());
    complete(fixture.componentInstance);

    fixture.componentInstance.submitResponse();
    await settle();
    fixture.detectChanges();

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: 'Competition season not found. Press Try Again to resend it.' }));
    expect(fixture.nativeElement.textContent).toContain('Try Again');
    expect(fixture.nativeElement.textContent).not.toContain('Error!');
  });

  /**
   * #2559: in a phone's browser the site remembers whether it may use the location, so the form checks
   * first. It does not ask a site that is blocked, says how to allow it on this phone, and picks the
   * location up by itself once it is allowed.
   */
  describe('location permission', () => {
    let status: { state: PermissionState; addEventListener: jest.Mock; removeEventListener: jest.Mock };

    /**
     * Gives the browser a Permissions API that answers `state` for the location, as Safari 16 and
     * later and Chrome do.
     */
    const permission = (state: PermissionState) => {
      status = { state, addEventListener: jest.fn(), removeEventListener: jest.fn() };
      Object.defineProperty(navigator, 'permissions', { value: { query: jest.fn(() => Promise.resolve(status)) }, configurable: true });
    };

    /**
     * The site's permission changes, for example after it is allowed in the phone's settings.
     */
    const change = (state: PermissionState) => {
      status.state = state;
      status.addEventListener.mock.calls.filter(([type]) => type === 'change').forEach(([, listener]) => listener());
    };

    const userAgent = (value: string) => jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(value);

    afterEach(() => {
      delete (navigator as unknown as { permissions?: unknown }).permissions;
      jest.restoreAllMocks();
    });

    it('does not ask for the location when the site is already blocked, and says so', async () => {
      permission('denied');
      const fixture = create();
      await settle();
      fixture.detectChanges();

      expect(navigator.geolocation.watchPosition).not.toHaveBeenCalled();
      expect(fixture.componentInstance.locationStatus.getValue()).toBe('blocked');
      expect(fixture.nativeElement.textContent).toContain('Location access is blocked');
      expect(preset).toHaveBeenCalledWith('no_gps');
    });

    it('follows the location without asking when the site is already allowed', async () => {
      permission('granted');
      const fixture = create();
      await settle();

      expect(watchers.length).toBe(1);
      watchers[0].ok(position());
      expect(fixture.componentInstance.locationStatus.getValue()).toBe('found');
    });

    it('asks once: allowing the prompt does not start a second watch', async () => {
      permission('prompt');
      create();
      await settle();
      expect(watchers.length).toBe(1);

      change('granted');

      expect(watchers.length).toBe(1);
    });

    it('picks the location up by itself once it is allowed in the settings', async () => {
      permission('denied');
      const fixture = create();
      await settle();
      expect(watchers.length).toBe(0);

      change('granted');
      watchers[0].ok(position());

      expect(fixture.componentInstance.locationStatus.getValue()).toBe('found');
    });

    it('stops listening for changes when the form closes', async () => {
      permission('granted');
      const fixture = create();
      await settle();

      fixture.destroy();

      expect(status.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('shows the steps for Safari on an iPhone when location is blocked', async () => {
      userAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'
      );
      permission('denied');
      const fixture = create();
      await settle();
      fixture.detectChanges();

      const help = fixture.nativeElement.textContent;
      expect(help).toContain('Safari on iPhone or iPad');
      expect(help).toContain('Safari Websites');
      expect(help).toContain('Then tap Submit again.');
    });

    it('shows the steps for Chrome on an iPhone, which has its own entry in Location Services', async () => {
      userAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1'
      );
      permission('denied');
      const fixture = create();
      await settle();
      fixture.detectChanges();

      const help = fixture.nativeElement.textContent;
      expect(help).toContain('Chrome on iPhone or iPad');
      expect(help).toContain('tap Chrome, choose While Using the App');
      expect(help).not.toContain('Safari Websites');
    });

    it('shows the steps for Chrome on Android when location is blocked', async () => {
      userAgent(
        'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'
      );
      permission('denied');
      const fixture = create();
      await settle();
      fixture.detectChanges();

      const help = fixture.nativeElement.textContent;
      expect(help).toContain('Chrome on Android');
      expect(help).toContain('left of the address bar, then Permissions');
    });
  });

  /**
   * #1786: an upload that does not reach the server is sent again, after 2, 5 and 10 seconds, before
   * the form gives up; one the server refused is not.
   */
  describe('retrying an upload', () => {
    let attempts: number;

    /**
     * An upload whose first `failures` attempts fail with `error`, and which then succeeds.
     */
    const upload = (failures: number, error: unknown) => {
      attempts = 0;
      postSubmission.mockReturnValue(
        defer(() => (++attempts <= failures ? throwError(() => error) : of({ type: HttpEventType.Response })))
      );
    };

    const submitted = () => {
      const fixture = create();
      watchers[0].ok(position());
      complete(fixture.componentInstance);
      fixture.componentInstance.submitResponse();
      flushMicrotasks();
      tick(0);

      return fixture;
    };

    it('sends it again when it did not reach the server, and saves it once it does', fakeAsync(() => {
      upload(2, { status: 0 });
      const router = TestBed.inject(Router);
      submitted();

      expect(attempts).toBe(1);
      tick(2000);
      expect(attempts).toBe(2);
      tick(5000);
      expect(attempts).toBe(3);

      expect(router.navigate).toHaveBeenCalledWith(['complete'], expect.anything());
      expect(toast).not.toHaveBeenCalled();
    }));

    it('gives up after three more tries, and says the connection is the problem', fakeAsync(() => {
      upload(10, { status: 0 });
      const fixture = submitted();

      tick(2000 + 5000 + 10000);

      expect(attempts).toBe(4);
      expect(fixture.componentInstance.submissionStatus.getValue()).toBe(-1);
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('did not reach the server') }));

      tick(60000);
      expect(attempts).toBe(4);
    }));

    it('does not send again what the server refused', fakeAsync(() => {
      upload(10, { status: 422, error: { message: 'Competition season not found.' } });
      submitted();

      tick(60000);

      expect(attempts).toBe(1);
      expect(toast).toHaveBeenCalledTimes(1);
    }));

    it('sends one id for the submission, the same on every retry and on Try Again', fakeAsync(() => {
      upload(10, { status: 0 });
      const fixture = submitted();
      tick(2000 + 5000 + 10000);
      expect(attempts).toBe(4);

      // Try Again.
      fixture.componentInstance.submitResponse();
      flushMicrotasks();
      tick(2000 + 5000 + 10000);

      const ids = postSubmission.mock.calls.map(([data]) => (data as FormData).get('guid'));
      expect(ids).toHaveLength(2);
      expect(ids[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(ids[1]).toBe(ids[0]);
    }));

    it('keeps the id for Try Again after the server refused it', fakeAsync(() => {
      upload(1, { status: 500, error: {} });
      const fixture = submitted();
      expect(fixture.componentInstance.submissionStatus.getValue()).toBe(-1);

      fixture.componentInstance.submitResponse();
      flushMicrotasks();
      tick(0);

      const ids = postSubmission.mock.calls.map(([data]) => (data as FormData).get('guid'));
      expect(ids).toHaveLength(2);
      expect(ids[1]).toBe(ids[0]);
    }));

    it('does not send a second time when Submit is tapped again while it is sending', fakeAsync(() => {
      upload(1, { status: 0 });
      const fixture = submitted();

      fixture.componentInstance.submitResponse();
      flushMicrotasks();
      tick(2000);

      expect(postSubmission).toHaveBeenCalledTimes(1);
      expect(attempts).toBe(2);
    }));
  });

  describe('changing a photo (#2545)', () => {
    const photo = (name: string) => new File([name], name, { type: 'image/jpeg' });

    /**
     * What the browser hands `change` when a picture is chosen: the input, holding the file and its path.
     */
    const chosen = (file: File) => ({ target: { files: [file], value: `C:\\fakepath\\${file.name}` } });

    beforeEach(() => {
      // jsdom has no object URLs, which the photo's preview is drawn from.
      URL.createObjectURL = jest.fn(() => 'blob:preview');
    });

    it.each([
      ['photo', 1],
      ['photo2', 2]
    ] as const)('says the %s box can be tapped to change its picture, once one is chosen', (input, box) => {
      const fixture = create();
      const container: HTMLElement = fixture.nativeElement.querySelector(`input[name=${input}]`).parentElement;

      expect(container.textContent).not.toContain('Tap to change');

      fixture.componentInstance.onPhotoTaken(chosen(photo('first.jpg')), box);
      fixture.detectChanges();

      expect(container.textContent).toContain('Tap to change');
      expect(container.querySelector(`input[name=${input}]`)).not.toBeNull();
    });

    it('replaces the picture with the next one chosen, and lets the same file be chosen again', () => {
      const fixture = create();
      const first = chosen(photo('first.jpg'));

      fixture.componentInstance.onPhotoTaken(first, 1);

      // A browser fires no change for a file input whose value is unchanged, so it must be emptied.
      expect(first.target.value).toBe('');

      fixture.componentInstance.onPhotoTaken(chosen(photo('second.jpg')), 1);

      expect(fixture.componentInstance.file.getValue().name).toBe('second.jpg');
    });
  });
});

describe('submissionFailureMessage', () => {
  it('blames the connection when the request never reached the server', () => {
    expect(submissionFailureMessage({ status: 0 })).toContain('did not reach the server');
    expect(submissionFailureMessage(undefined)).toContain('did not reach the server');
  });

  it('says a photograph is too large when the server refuses its size', () => {
    expect(submissionFailureMessage({ status: 413, error: { message: 'File too large' } })).toBe(
      'A photograph is too large to upload. Take it again, then press Try Again.'
    );
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

describe('uploadMayBeRetried', () => {
  it('retries an upload that never reached the server, or met a gateway that was briefly down', () => {
    expect(uploadMayBeRetried({ status: 0 })).toBe(true);
    expect(uploadMayBeRetried(undefined)).toBe(true);
    expect(uploadMayBeRetried({ status: 502 })).toBe(true);
    expect(uploadMayBeRetried({ status: 503 })).toBe(true);
    expect(uploadMayBeRetried({ status: 504 })).toBe(true);
  });

  it('does not retry what the server answered', () => {
    expect(uploadMayBeRetried({ status: 400 })).toBe(false);
    expect(uploadMayBeRetried({ status: 401 })).toBe(false);
    expect(uploadMayBeRetried({ status: 413 })).toBe(false);
    expect(uploadMayBeRetried({ status: 500 })).toBe(false);
  });
});

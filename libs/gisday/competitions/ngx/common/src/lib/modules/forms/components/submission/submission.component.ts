import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
  input,
  signal
} from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, from, Observable, of, Subject, throwError, timer } from 'rxjs';
import { catchError, filter, map, retry, shareReplay, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { locationHelp } from '@tamu-gisc/common/utils/device';
import { geolocationPermission } from '@tamu-gisc/common/utils/geometry';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { shrinkImage } from '@tamu-gisc/common/utils/ui';
import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { NgStyle, AsyncPipe, DecimalPipe } from '@angular/common';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, NgStyle, SelectComponent, TextboxComponent, AsyncPipe, DecimalPipe]
})
export class SubmissionComponent implements OnInit, OnChanges, OnDestroy {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly ns = inject(NotificationService);
  private readonly analytics = inject(Angulartics2);
  private readonly ss = inject(SubmissionService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  public readonly formModel = input<Partial<CompetitionSeason>>(undefined);

  public form: UntypedFormGroup;

  public file: BehaviorSubject<File> = new BehaviorSubject(undefined);
  public file2: BehaviorSubject<File> = new BehaviorSubject(undefined);

  public fileUrl: Observable<string> = this.file.pipe(map((f) => (f !== undefined ? URL.createObjectURL(f) : undefined)));

  public fileUrl2: Observable<string> = this.file2.pipe(map((f) => (f !== undefined ? URL.createObjectURL(f) : undefined)));

  public readonly location = signal<GeolocationPosition>(undefined);

  /**
   * Whether the form has the phone's location yet (#1784): still finding it, finding it slowly (after
   * a few failed attempts), found, or refused.
   */
  public locationStatus: BehaviorSubject<SubmissionLocationStatus> = new BehaviorSubject('finding');

  /**
   * How to allow the location on this phone and browser, shown when it is blocked (#2559).
   */
  public readonly locationHelp = locationHelp();

  public formValid: Observable<boolean>;

  public submissionProgress: BehaviorSubject<number> = new BehaviorSubject(0);
  public submissionStatus: BehaviorSubject<number> = new BehaviorSubject(0);

  private _destroy$: Subject<boolean> = new Subject();
  private _trackLocation: TrackLocation;

  /**
   * This submission's id, made on the first Submit and kept for every automatic retry and Try Again,
   * so a submission whose answer was lost and is sent again is saved once (#1786). Undefined on a
   * browser that cannot make one; the server then makes its own.
   */
  private _submissionGuid: string;

  public ngOnInit(): void {
    // A browser remembers for each site whether it may use the location, so check before asking: a
    // site already allowed is not asked, and a blocked one is not asked again but is followed as soon
    // as it is allowed, in the settings or anywhere else (#2559). Where the browser cannot say, the
    // watch asks, as it always has.
    geolocationPermission()
      .pipe(takeUntil(this._destroy$))
      .subscribe((state) => {
        if (state === 'denied') {
          this._trackLocation?.dispose();
          this._trackLocation = undefined;
          this._showBlocked();
        } else if (this._trackLocation === undefined) {
          this._trackPosition();
        }
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.formModel && changes.formModel.currentValue !== undefined && changes.formModel.currentValue !== null) {
      this.form = this.fb.group({
        fields: this.fb.array(
          changes.formModel.currentValue.form.model
            .filter((c) => {
              return c.enabled === true;
            })
            .map((control) => {
              return this.fb.group({
                ...control,
                options: control.options.length > 0 ? this.fb.array(control.options) : [],
                value: [undefined, Validators.required]
              });
            })
        )
      });

      // Some seasons will not request anything more than an image for the survey. In this case, the form control size will be zero and there
      // will be no form controls to ever emit form statusChanges. If that's the case, emit a VALID state for the form statusChanges so the
      // only other thing to check is the image input change.
      this.formValid = combineLatest([
        (this.form.get('fields') as UntypedFormArray).controls.length > 0 ? this.form.statusChanges : of('VALID'),
        this.file.pipe(filter((e) => e !== undefined))
      ]).pipe(
        startWith(['INVALID']),
        map(([formValid]) => {
          return formValid === 'VALID';
        }),
        shareReplay()
      );
    }
  }

  public ngOnDestroy() {
    this._trackLocation?.dispose();
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Follows the phone's location. A timeout or a position not yet available is common on a first fix
   * or beside buildings, so it keeps watching through them, and after a few says to check that Location
   * is on; only refused access stops it.
   */
  private _trackPosition() {
    let failures = 0;

    this._trackLocation?.dispose();
    this.locationStatus.next('finding');
    this._trackLocation = new TrackLocation({
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000,
      keepWatching: () => {
        failures++;

        if (failures >= LOCATION_FAILURES_BEFORE_HINT && this.locationStatus.getValue() === 'finding') {
          this.locationStatus.next('slow');
        }
      }
    });

    this._trackLocation
      .track()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.location.set(res);
          this.locationStatus.next('found');
        },
        error: (err: GeolocationPositionError) => {
          // TrackLocation keeps watching through every other error, so this is a refusal.
          this._trackLocation = undefined;
          this._showBlocked();
        }
      });
  }

  /**
   * Says location is blocked, once: a refusal is heard both from the watch and from the permission.
   */
  private _showBlocked() {
    if (this.locationStatus.getValue() !== 'blocked') {
      this.locationStatus.next('blocked');
      this.ns.preset('no_gps');
    }
  }

  public onPhotoTaken(e, fileNumber: 1 | 2 = 1) {
    const fileList: FileList = e.target.files;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        if (fileNumber === 1) {
          this.file.next(fileList[i]);
        } else {
          this.file2.next(fileList[i]);
        }
        break;
      }
    }
  }

  public submitResponse() {
    // Without a location the submission cannot be placed, so say why instead of failing (#1784).
    if (this.location() === undefined && this.form?.valid && this.formModel()?.allowSubmissions === true) {
      // Not 'found': that comes with a location.
      const status = this.locationStatus.getValue() as Exclude<SubmissionLocationStatus, 'found'>;

      this.ns.toast({
        id: 'submission-no-location',
        title: 'No Location Yet',
        message: NO_LOCATION_MESSAGES[status]
      });

      // Refused access ends tracking, so start again: if the participant has since allowed it, the
      // location arrives and the next Submit sends it.
      if (status === 'blocked') {
        this._trackPosition();
      }

      return undefined;
    }

    const formModel = this.formModel();

    if (!this.form?.valid || this.submissionStatus.getValue() === 1 || formModel?.allowSubmissions !== true) {
      return undefined;
    }

    // Busy from the first tap, so a second tap while the photographs shrink cannot submit twice.
    this.submissionStatus.next(1);
    this.submissionProgress.next(0);

    this._submissionGuid ??= globalThis.crypto?.randomUUID?.();

    return combineLatest([this.file.pipe(take(1)), this.file2.pipe(take(1))])
      .pipe(
        // Shrink the photographs on the phone before upload (#1786); a photograph that cannot be shrunk
        // is sent as it is.
        switchMap(([file, file2]) => from(Promise.all([shrinkImage(file), file2 !== undefined ? shrinkImage(file2) : undefined]))),
        switchMap(([file, file2]) => {
          // FormData gets sent as multi-part form in request.
          const data: FormData = new FormData();

          const location = {
            latitude: this.location().coords.latitude,
            longitude: this.location().coords.longitude,
            accuracy: this.location().coords.accuracy,
            altitude: this.location().coords.altitude,
            altitudeAccuracy: this.location().coords.altitudeAccuracy,
            heading: this.location().coords.heading,
            speed: this.location().coords.speed
          };

          const value = this.form.getRawValue().fields.reduce((acc, curr) => {
            acc[curr.attribute] = curr.value;

            return acc;
          }, {});

          // Who is submitting comes from the sign-in the request carries, not from the form (#1780).
          data.append('location', JSON.stringify(location));
          data.append('value', JSON.stringify(value));
          data.append('season', formModel.season.guid);
          if (this._submissionGuid !== undefined) {
            data.append('guid', this._submissionGuid);
          }
          data.append('head1', file);
          if (file2 !== undefined) {
            data.append('head2', file2);
          }

          return this.ss.postSubmission(data).pipe(
            // An upload that did not reach the server is sent again a few times before giving up, for a
            // weak signal on campus (#1786). One the server refused is not. Each attempt carries the same
            // id, so one that was saved but whose answer was lost is not saved twice.
            retry({
              count: UPLOAD_RETRY_DELAYS.length,
              delay: (err, attempt) => (uploadMayBeRetried(err) ? timer(UPLOAD_RETRY_DELAYS[attempt - 1]) : throwError(() => err))
            }),
            switchMap((event) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.submissionProgress.next(event.total ? event.loaded / event.total : 0);
                return EMPTY;
              } else if (event.type === HttpEventType.Response) {
                this._submissionGuid = undefined;
                this.router.navigate(['complete'], { relativeTo: this.route });

                // Returning nothing here made switchMap throw, so a saved submission went on to
                // the failure message (#1784).
                return EMPTY;
              } else {
                return EMPTY;
              }
            })
          );
        }),
        catchError((err) => {
          this.submissionStatus.next(-1);

          this.ns.toast({
            id: 'submission-failure',
            title: 'Submission Not Saved',
            message: submissionFailureMessage(err)
          });

          this.analytics.eventTrack.next({
            action: 'submission_fail',
            properties: {
              category: 'error',
              gstCustom: {
                message: err.message
              }
            }
          });

          return of(err);
        })
      )
      .subscribe();
  }
}

export type SubmissionLocationStatus = 'finding' | 'slow' | 'found' | 'blocked';

/**
 * How many timeouts or unavailable positions before the form suggests checking that Location is on.
 */
const LOCATION_FAILURES_BEFORE_HINT = 3;

/**
 * What Submit says when there is no location yet, by why there is none.
 */
const NO_LOCATION_MESSAGES: Record<Exclude<SubmissionLocationStatus, 'found'>, string> = {
  finding: 'Your phone is still finding your location. Wait until the form shows it has been found, then submit again.',
  slow: "Your phone has not found your location yet. Make sure Location is on in your phone's settings, then submit again.",
  blocked: 'Location access is blocked. Follow the steps on the form to allow it, then submit again.'
};

/**
 * Seconds to wait before each new attempt at an upload that did not reach the server (#1786).
 */
export const UPLOAD_RETRY_DELAYS = [2000, 5000, 10000];

/**
 * Whether an upload failed in a way sending it again may fix: it never reached the server, or a
 * gateway in front of the server was briefly unavailable.
 */
export function uploadMayBeRetried(err: { status?: number }): boolean {
  return !err?.status || err.status === 502 || err.status === 503 || err.status === 504;
}

/**
 * What to tell a participant whose upload failed.
 */
export function submissionFailureMessage(err: { status?: number; error?: { message?: string | Array<string> } }): string {
  if (!err?.status) {
    return 'The upload did not reach the server. Check your connection, then press Try Again.';
  }

  if (err.status === 413) {
    return 'A photograph is too large to upload. Take it again, then press Try Again.';
  }

  if (err.status === 401) {
    return 'You have been signed out. Sign in again, then press Try Again.';
  }

  const reason = Array.isArray(err.error?.message) ? err.error.message.join(' ') : err.error?.message;

  return reason ? `${reason} Press Try Again to resend it.` : 'The server could not save it. Press Try Again to resend it.';
}

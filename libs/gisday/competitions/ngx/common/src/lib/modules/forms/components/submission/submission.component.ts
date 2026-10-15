import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ChangeDetectionStrategy,
  inject,
  input
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
import { BehaviorSubject, combineLatest, EMPTY, NEVER, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, shareReplay, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { NgStyle, AsyncPipe, DecimalPipe } from '@angular/common';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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

  public location: GeolocationPosition;

  /**
   * Whether the form has the phone's location yet (#1784): still finding it, found, or refused.
   */
  public locationStatus: BehaviorSubject<SubmissionLocationStatus> = new BehaviorSubject('finding');

  public formValid: Observable<boolean>;

  public submissionProgress: BehaviorSubject<number> = new BehaviorSubject(0);
  public submissionStatus: BehaviorSubject<number> = new BehaviorSubject(0);

  private _destroy$: Subject<boolean> = new Subject();
  private _trackLocation: TrackLocation;
  private _retryTracking: ReturnType<typeof setTimeout>;

  public ngOnInit(): void {
    this._trackPosition();
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
    clearTimeout(this._retryTracking);
    this._trackLocation?.dispose();
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  /**
   * Follows the phone's location. A timeout or a position not yet available is common on a first fix
   * or beside buildings, so tracking starts again; only refused access stops it.
   */
  private _trackPosition() {
    this._trackLocation?.dispose();
    this._trackLocation = new TrackLocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });

    this._trackLocation
      .track()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.location = res;
          this.locationStatus.next('found');
        },
        error: (err: GeolocationPositionError) => {
          if (err?.code === LOCATION_PERMISSION_DENIED) {
            this.locationStatus.next('blocked');
            this.ns.preset('no_gps');
          } else {
            this._retryTracking = setTimeout(() => this._trackPosition(), 2000);
          }
        }
      });
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
    if (this.location === undefined && this.form?.valid && this.formModel()?.allowSubmissions === true) {
      this.ns.toast({
        id: 'submission-no-location',
        title: 'No Location Yet',
        message:
          this.locationStatus.getValue() === 'blocked'
            ? 'Location access is blocked. Allow this site to use your location in your phone settings, then submit again.'
            : 'Your phone is still finding your location. Wait until the form shows it has been found, then submit again.'
      });

      return undefined;
    }

    return (
      combineLatest([this.file.pipe(take(1)), this.file2.pipe(take(1))])
        .pipe(
          switchMap(([file, file2]) => {
            // if (file !== undefined && this.form.valid && this.submissionStatus.getValue() !== 1) {
            const formModel = this.formModel();
            if (this.form.valid && this.submissionStatus.getValue() !== 1 && formModel?.allowSubmissions === true) {
              // FormData gets sent as multi-part form in request.
              const data: FormData = new FormData();

              const location = {
                latitude: this.location.coords.latitude,
                longitude: this.location.coords.longitude,
                accuracy: this.location.coords.accuracy,
                altitude: this.location.coords.altitude,
                altitudeAccuracy: this.location.coords.altitudeAccuracy,
                heading: this.location.coords.heading,
                speed: this.location.coords.speed
              };

              const value = this.form.getRawValue().fields.reduce((acc, curr) => {
                acc[curr.attribute] = curr.value;

                return acc;
              }, {});

              // Who is submitting comes from the sign-in the request carries, not from the form (#1780).
              data.append('location', JSON.stringify(location));
              data.append('value', JSON.stringify(value));
              data.append('season', formModel.season.guid);
              data.append('head1', file);
              if (file2 !== undefined) {
                data.append('head2', file2);
              }

              return this.ss.postSubmission(data).pipe(
                switchMap((event) => {
                  if (event.type === HttpEventType.UploadProgress) {
                    if (this.submissionStatus.getValue() !== 1) {
                      this.submissionStatus.next(1);
                    }

                    this.submissionProgress.next(event.loaded / event.total);
                    return EMPTY;
                  } else if (event.type === HttpEventType.Response) {
                    this.router.navigate(['complete'], { relativeTo: this.route });
                  } else {
                    return EMPTY;
                  }
                })
              );
            } else {
              return NEVER;
            }
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
        .subscribe()
    );
  }
}

export type SubmissionLocationStatus = 'finding' | 'found' | 'blocked';

/**
 * `GeolocationPositionError.PERMISSION_DENIED`, which is not defined outside a browser.
 */
const LOCATION_PERMISSION_DENIED = 1;

/**
 * What to tell a participant whose upload failed.
 */
export function submissionFailureMessage(err: { status?: number; error?: { message?: string | Array<string> } }): string {
  if (!err?.status) {
    return 'The upload did not reach the server. Check your connection, then press Try Again.';
  }

  if (err.status === 401) {
    return 'You have been signed out. Sign in again, then press Try Again.';
  }

  const reason = Array.isArray(err.error?.message) ? err.error.message.join(' ') : err.error?.message;

  return reason ? `${reason} Press Try Again to resend it.` : 'The server could not save it. Press Try Again to resend it.';
}

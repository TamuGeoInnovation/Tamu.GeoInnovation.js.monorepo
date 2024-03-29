import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, NEVER, Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

import { Angulartics2 } from 'angulartics2';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { SubmissionService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public formModel: Partial<CompetitionSeason>;

  public form: FormGroup;

  public file: BehaviorSubject<File> = new BehaviorSubject(undefined);

  public fileUrl: Observable<string> = this.file.pipe(
    switchMap((f) => {
      if (f !== undefined) {
        return of(URL.createObjectURL(f));
      } else {
        of(undefined);
      }
    })
  );

  public location: GeolocationPosition;

  public formValid: Observable<boolean>;

  public submissionProgress: BehaviorSubject<number> = new BehaviorSubject(0);
  public submissionStatus: BehaviorSubject<number> = new BehaviorSubject(0);

  private _destroy$: Subject<boolean> = new Subject();
  private _trackLocation: TrackLocation;

  constructor(
    private readonly fb: FormBuilder,
    private readonly as: AuthService,
    private readonly ns: NotificationService,
    private readonly analytics: Angulartics2,
    private readonly ss: SubmissionService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this._trackLocation = new TrackLocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 2500 });

    this._trackLocation
      .track()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (res) => {
          this.location = res;
        },
        () => {
          this.ns.preset('no_gps');
        }
      );
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
        (this.form.get('fields') as FormArray).controls.length > 0 ? this.form.statusChanges : of('VALID')
        // this.file.pipe(filter((e) => e !== undefined))
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
    this._trackLocation.dispose();
    this._destroy$.next(undefined);
    this._destroy$.complete();
  }

  public onPhotoTaken(e) {
    const fileList: FileList = e.target.files;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        this.file.next(fileList[i]);
        break;
      }
    }
  }

  public submitResponse() {
    return (
      combineLatest([this.as.user$])
        // return combineLatest([this.file.pipe(take(1)), this.as.user$])
        .pipe(
          // switchMap(([file, user]) => {
          switchMap(([user]) => {
            // if (file !== undefined && this.form.valid && this.submissionStatus.getValue() !== 1) {
            if (this.form.valid && this.submissionStatus.getValue() !== 1 && this.formModel?.allowSubmissions === true) {
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

              data.append('userGuid', `${user.sub}`);
              data.append('location', JSON.stringify(location));
              data.append('value', JSON.stringify(value));
              data.append('season', this.formModel.season.guid);
              // data.append('head1', file);

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

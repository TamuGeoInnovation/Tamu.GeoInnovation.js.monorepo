import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, EMPTY, NEVER, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

import { Angulartics2 } from 'angulartics2';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { CompetitionForm } from '@tamu-gisc/gisday/common';

import { SubmissionService } from '../../../data-access/submission/submission.service';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public formModel: CompetitionForm['model'];

  public form: FormArray;

  public file: BehaviorSubject<File> = new BehaviorSubject(undefined);

  public fileUrl: Observable<string> = this.file.pipe(
    switchMap((f) => {
      if (Boolean(f)) {
        return of(URL.createObjectURL(f));
      } else {
        of(undefined);
      }
    })
  );

  public location: Position;

  public formValid: Observable<boolean>;

  public submissionStatus = {
    progress: 0,
    status: 0
  };

  private _destroy$: Subject<boolean> = new Subject();
  private _trackLocation: TrackLocation;

  constructor(
    private readonly fb: FormBuilder,
    private readonly ns: NotificationService,
    private readonly env: EnvironmentService,
    private readonly settings: SettingsService,
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
        (err) => {
          this.ns.preset('no_gps');
        }
      );
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.formModel && changes.formModel.currentValue !== undefined && changes.formModel.currentValue !== null) {
      this.form = this.fb.array(
        changes.formModel.currentValue
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
      );

      this.formValid = combineLatest([this.form.statusChanges, this.file.pipe(filter((e) => e !== undefined))]).pipe(
        map(([formValid, fileValid]) => {
          return formValid === 'VALID' && fileValid !== undefined;
        })
      );
    }
  }

  public ngOnDestroy() {
    this._trackLocation.dispose();
    this._destroy$.next();
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
    return combineLatest([
      this.file.pipe(take(1)),
      this.settings.getSimpleSettingsBranch(this.env.value('LocalStoreSettings').subKey).pipe(take(1))
    ])
      .pipe(
        switchMap(([file, settings]) => {
          if (file !== undefined && this.form.valid) {
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

            const value = this.form.getRawValue().reduce((acc, curr) => {
              acc[curr.attribute] = curr.value;

              return acc;
            }, {});

            data.append('userGuid', `${settings.guid}`);
            data.append('location', JSON.stringify(location));
            data.append('value', JSON.stringify(value));
            data.append('head1', file);

            return this.ss.postSubmission(data).pipe(
              switchMap((event) => {
                if (event.type === HttpEventType.UploadProgress) {
                  this.submissionStatus.progress = event.loaded / event.total;
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
          this.analytics.eventTrack.next({
            action: 'Submission Fail',
            properties: {
              category: 'Error',
              label: JSON.stringify(err)
            }
          });

          return of(err);
        })
      )
      .subscribe((res) => {});
  }
}

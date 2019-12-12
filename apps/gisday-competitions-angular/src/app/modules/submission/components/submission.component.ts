import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, throwError, EMPTY, timer, Subject } from 'rxjs';
import { switchMap, shareReplay, debounceTime, take, catchError, mergeMap, takeUntil } from 'rxjs/operators';

import { Angulartics2 } from 'angulartics2';

import { SubmissionService } from '../providers/submission.service';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { HttpEventType } from '@angular/common/http';

import { TrackLocation } from '@tamu-gisc/common/utils/geometry/generic';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit, OnDestroy {
  public dataSource = [
    {
      name: 'Building Identification (5 pts)',
      value: '54AAB1B5-F925-459C-9E28-C8722EAF5A0C'
    },
    {
      name: 'Accessible Building Signs (4 pts)',
      value: 'FD68B430-ED9C-430D-A59A-EF30EC746CE7'
    },
    {
      name: 'Memorial Bench & Tree Plaques (3 pts)',
      value: '8E3679FA-15D4-456A-A596-FD0E14B25EF9'
    },
    {
      name: 'Historical Markers (2 pts)',
      value: '5617C23F-5B7F-4A6C-BA8E-F40D7417356C'
    },
    {
      name: 'Parking Lot and Vehicular Direction (1 pt)',
      value: '4A041D35-A4A9-421A-94F6-FD534C0281DD'
    },
    {
      name: 'Other (Describe Below) (1 pt)',
      value: 'D5E20F64-82C1-459B-A73E-F5F73EE5A3A2'
    }
  ];

  public file: BehaviorSubject<File> = new BehaviorSubject(undefined);
  public signType: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public signDetails: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public location: Position;

  public fileUrl: Observable<string> = this.file.pipe(
    switchMap((f) => {
      if (Boolean(f)) {
        return of(URL.createObjectURL(f));
      } else {
        of(undefined);
      }
    })
  );

  public form = {
    valid: undefined,
    // 0 is default, 1 is success, -1 is fail
    status: 0,
    progress: 0
  };

  private _destroy$: Subject<boolean> = new Subject();
  private _trackLocation: TrackLocation;

  constructor(
    private environment: EnvironmentService,
    private submissionService: SubmissionService,
    private settings: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
    private analytics: Angulartics2,
    private notification: NotificationService
  ) {
    this._trackLocation = new TrackLocation({ enableHighAccuracy: true, maximumAge: 10000, timeout: 2500 });

    this._trackLocation
      .track()
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (res) => {
          this.location = res;
        },
        (err) => {
          this.notification.preset('no_gps');
        }
      );
  }

  public ngOnInit() {
    this.form.valid = combineLatest([this.file, this.signType, this.signDetails.pipe(debounceTime(200))]).pipe(
      switchMap(([file, type, details]) => {
        if (Boolean(file)) {
          if (type && type !== 'D5E20F64-82C1-459B-A73E-F5F73EE5A3A2') {
            this.form.status = 0;
            return of(true);
          } else if (type && type === 'D5E20F64-82C1-459B-A73E-F5F73EE5A3A2' && details) {
            this.form.status = 0;
            return of(true);
          }
        }

        return of(false);
      }),
      shareReplay(1)
    );
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

  public submitSubmission() {
    this.form.valid
      .pipe(
        take(1),
        switchMap((v) => {
          // If form valid status is true, return the observable values for submission
          if (Boolean(v)) {
            return combineLatest([
              this.file,
              this.signType,
              this.signDetails,
              this.settings.getSimpleSettingsBranch(this.environment.value('LocalStoreSettings').subKey)
            ]);
          } else {
            return of([false, false, false]);
          }
        }),
        switchMap(([file, type, details, settings]) => {
          try {
            if (file !== false && this.form.status !== 1) {
              // FormData gets sent as multi-part form in request.
              const data: FormData = new FormData();

              data.append('UserGuid', settings.guid);
              data.append('Description', details);
              data.append('SignType', type);
              data.append('Lat', this.location.coords.latitude ? this.location.coords.latitude.toString() : undefined);
              data.append('Lon', this.location.coords.longitude ? this.location.coords.longitude.toString() : undefined);
              data.append('Accuracy', this.location.coords.accuracy ? this.location.coords.accuracy.toString() : undefined);
              data.append('Timestamp', this.location.timestamp ? this.location.timestamp.toString() : undefined);
              data.append('Heading', this.location.coords.heading ? this.location.coords.heading.toString() : undefined);
              data.append('Altitude', this.location.coords.altitude ? this.location.coords.altitude.toString() : undefined);
              data.append('Speed', this.location.coords.speed ? this.location.coords.speed.toString() : undefined);
              data.append('photoA', file);

              this.form.status = 1;

              return this.submissionService.postSubmission(data).pipe(
                switchMap((event) => {
                  if (event.type === HttpEventType.UploadProgress) {
                    this.form.progress = event.loaded / event.total;
                    return EMPTY;
                  } else if (event.type === HttpEventType.Response) {
                    if (event && event.body.ResultCode && event.body.ResultCode === '400') {
                      this.router.navigate(['complete'], { relativeTo: this.route });
                      return of(true);
                    } else {
                      return throwError(event);
                    }
                  } else {
                    return EMPTY;
                  }
                })
              );
            } else {
              return of(false);
            }
          } catch (err) {
            return throwError(err);
          }
        }),
        catchError((err) => {
          this.form.status = -1;
          this.form.progress = 0;

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

  public resetSubmission() {
    this.signType = undefined;
    this.signDetails = undefined;
  }
}

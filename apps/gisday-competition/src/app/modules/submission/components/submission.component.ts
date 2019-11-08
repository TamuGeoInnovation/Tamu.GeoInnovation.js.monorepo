import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, BehaviorSubject, of, timer } from 'rxjs';
import { switchMap, shareReplay, debounceTime, take } from 'rxjs/operators';

import { LocationService } from '../providers/location.service';
import { SubmissionService } from '../providers/submission.service';
import { SettingsService } from '@tamu-gisc/common/ngx/settings';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
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
    status: 0
  };

  constructor(
    private locationService: LocationService,
    private submissionService: SubmissionService,
    private settings: SettingsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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
          if (Boolean(v)) {
            return combineLatest([
              this.file,
              this.signType,
              this.signDetails,
              this.settings.getSimpleSettingsBranch('gisday-app')
            ]);
          } else {
            return of([false, false, false]);
          }
        }),
        switchMap(([file, type, details, settings]) => {
          if (file !== false && this.form.status !== 1) {
            const data: FormData = new FormData();
            data.append('UserGuid', settings.guid);
            data.append('Description', details);
            data.append('SignType', type);
            data.append('Lat', this.locationService.currentLocal.lat);
            data.append('Lon', this.locationService.currentLocal.lon);
            data.append('Accuracy', this.locationService.currentLocal.accuracy);
            data.append('Timestamp', this.locationService.currentLocal.timestamp);
            data.append('Heading', this.locationService.currentLocal.heading);
            data.append('Altitude', this.locationService.currentLocal.altitude);
            data.append('Speed', this.locationService.currentLocal.speed);
            data.append('photoA', file);

            this.form.status = 1;

            // return this.submissionService.postSubmission(data).pipe(
            //   switchMap((res) => {
            //     if (res && res.ResultCode && res.ResultCode === '400') {
            //       this.router.navigate(['complete'], { relativeTo: this.route });
            //       return of(true);
            //     } else {
            //       this.form.status = -1;
            //       return of(false);
            //     }
            //   })
            // );

            // Mock submission
            return timer(1000).pipe(
              switchMap(() => {
                this.router.navigate(['complete'], { relativeTo: this.route });
                return of(undefined);
              })
            );
          } else {
            return of(false);
          }
        })
      )
      .subscribe((res) => {});
  }

  public resetSubmission() {
    this.signType = undefined;
    this.signDetails = undefined;
  }
}

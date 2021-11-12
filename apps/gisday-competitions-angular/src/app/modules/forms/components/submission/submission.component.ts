import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SeasonForm } from '../../../data-access/form/form.service';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit, OnChanges {
  @Input()
  public formModel: SeasonForm['model'];

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

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.formModel && changes.formModel.currentValue !== undefined) {
      this.form = this.fb.array(
        this.formModel
          .filter((c) => {
            return c.enabled === true;
          })
          .map((control) => {
            return this.fb.group({
              ...control,
              options: control.options.length > 0 ? this.fb.array(control.options) : [],
              value: []
            });
          })
      );

      console.log(this.form.getRawValue());
    }
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
    const value = this.form.getRawValue();

    console.log(value);

    // this.form.valid
    //   .pipe(
    //     take(1),
    //     switchMap((v) => {
    //       // If form valid status is true, return the observable values for submission
    //       if (Boolean(v)) {
    //         return combineLatest([
    //           this.file,
    //           this.signType,
    //           this.signDetails,
    //           this.settings.getSimpleSettingsBranch(this.environment.value('LocalStoreSettings').subKey)
    //         ]);
    //       } else {
    //         return of([false, false, false]);
    //       }
    //     }),
    //     switchMap(([file, type, details, settings]) => {
    //       try {
    //         if (file !== false && this.form.status !== 1) {
    //           // FormData gets sent as multi-part form in request.
    //           const data: FormData = new FormData();

    //           data.append('UserGuid', settings.guid);
    //           data.append('Description', details);
    //           data.append('SignType', type);
    //           data.append('Lat', this.location.coords.latitude ? this.location.coords.latitude.toString() : undefined);
    //           data.append('Lon', this.location.coords.longitude ? this.location.coords.longitude.toString() : undefined);
    //           data.append('Accuracy', this.location.coords.accuracy ? this.location.coords.accuracy.toString() : undefined);
    //           data.append('Timestamp', this.location.timestamp ? this.location.timestamp.toString() : undefined);
    //           data.append('Heading', this.location.coords.heading ? this.location.coords.heading.toString() : undefined);
    //           data.append('Altitude', this.location.coords.altitude ? this.location.coords.altitude.toString() : undefined);
    //           data.append('Speed', this.location.coords.speed ? this.location.coords.speed.toString() : undefined);
    //           data.append('photoA', file);

    //           this.form.status = 1;

    //           return this.submissionService.postSubmission(data).pipe(
    //             switchMap((event) => {
    //               if (event.type === HttpEventType.UploadProgress) {
    //                 this.form.progress = event.loaded / event.total;
    //                 return EMPTY;
    //               } else if (event.type === HttpEventType.Response) {
    //                 if (event && event.body.ResultCode && event.body.ResultCode === '400') {
    //                   this.router.navigate(['complete'], { relativeTo: this.route });
    //                   return of(true);
    //                 } else {
    //                   return throwError(event);
    //                 }
    //               } else {
    //                 return EMPTY;
    //               }
    //             })
    //           );
    //         } else {
    //           return of(false);
    //         }
    //       } catch (err) {
    //         return throwError(err);
    //       }
    //     }),
    //     catchError((err) => {
    //       this.form.status = -1;
    //       this.form.progress = 0;

    //       this.analytics.eventTrack.next({
    //         action: 'Submission Fail',
    //         properties: {
    //           category: 'Error',
    //           label: JSON.stringify(err)
    //         }
    //       });

    //       return of(err);
    //     })
    //   )
    //   .subscribe((res) => {});
  }
}

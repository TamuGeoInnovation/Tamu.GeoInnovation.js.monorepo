import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Observable, Subject } from 'rxjs';

import { SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';

@Component({
  selector: 'tamu-gisc-upload-submission',
  templateUrl: './upload-submission.component.html',
  styleUrls: ['./upload-submission.component.scss']
})
export class UploadSubmissionComponent implements OnDestroy {
  public form: FormGroup;

  public $submissionTypes: Observable<Array<Partial<SubmissionType>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private submissionTypeService: SubmissionTypeService,
    private userSubmissionService: UserSubmissionsService
  ) {
    this.form = this.fb.group({
      title: [''],
      author: [''],
      abstract: [''],
      link: [''],
      submissionType: ['']
    });

    this.fetchSubmissionTypes();
  }

  public ngOnDestroy(): void {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public fetchSubmissionTypes() {
    this.$submissionTypes = this.submissionTypeService.getEntities();
  }

  public submit() {
    this.userSubmissionService.createEntity(this.form.getRawValue());
  }
}

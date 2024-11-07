import { Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-user-submission-add-edit-form',
  templateUrl: './user-submission-add-edit-form.component.html',
  styleUrls: ['./user-submission-add-edit-form.component.scss']
})
export class UserSubmissionAddEditFormComponent implements OnDestroy {
  @Input()
  public type: 'create' | 'edit';

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

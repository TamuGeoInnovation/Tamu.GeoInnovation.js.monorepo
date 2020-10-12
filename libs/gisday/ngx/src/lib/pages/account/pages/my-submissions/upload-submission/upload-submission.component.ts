import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/data-access';
import { SubmissionType } from '@tamu-gisc/gisday/data-api';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-upload-submission',
  templateUrl: './upload-submission.component.html',
  styleUrls: ['./upload-submission.component.scss']
})
export class UploadSubmissionComponent implements OnDestroy, OnInit {
  public form: FormGroup;
  public $userDetails: Observable<Partial<any>>;
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

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchSubmissionTypes() {
    this.$submissionTypes = this.submissionTypeService.getEntities();
  }

  public submit() {
    this.userSubmissionService.createEntity(this.form.getRawValue());
  }
}

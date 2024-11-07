import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, startWith, Subject, take } from 'rxjs';

import { SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Component({
  selector: 'tamu-gisc-user-submission-add-edit-form',
  templateUrl: './user-submission-add-edit-form.component.html',
  styleUrls: ['./user-submission-add-edit-form.component.scss']
})
export class UserSubmissionAddEditFormComponent implements OnInit, OnDestroy {
  @Input()
  public type: 'create' | 'edit';

  public form: FormGroup;

  public presentationStudentTypeOptions = [
    {
      type: 'undergraduate',
      label: 'Undergraduate'
    },
    {
      type: 'graduate',
      label: 'Graduate'
    }
  ];

  public presentationFormatOptions = [
    {
      format: 'individual',
      label: 'Individual'
    },
    {
      format: 'group',
      label: 'Group'
    }
  ];

  public $submissionTypes: Observable<Array<Partial<SubmissionType>>>;
  public selectedPresentationFormat$: Observable<string>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly fb: FormBuilder,
    private readonly submissionTypeService: SubmissionTypeService,
    private readonly userSubmissionService: UserSubmissionsService,
    private readonly seasonService: SeasonService,
    private readonly ns: NotificationService
  ) {
    this.form = this.fb.group({
      title: [''],
      authors: this.fb.array([this._createAuthor()]),
      abstract: [''],
      link: [''],
      submissionType: ['presentation'],
      presentationFormat: ['individual'],
      presentationStudentType: ['undergraduate'],
      season: ['']
    });

    this.fetchSubmissionTypes();
  }

  public ngOnInit(): void {
    this.selectedPresentationFormat$ = this.form
      .get('presentationFormat')
      .valueChanges.pipe(startWith(this.form.get('presentationFormat').value));

    // If the presentationFormat changes from group to individual, remove all authors except the first one.
    this.form
      .get('presentationFormat')
      .valueChanges.pipe()
      .subscribe((format) => {
        if (format === 'individual') {
          while ((this.form.get('authors') as FormArray).length > 1) {
            (this.form.get('authors') as FormArray).removeAt(1);
          }
        }
      });

    this.seasonService
      .getActiveSeason()
      .pipe(take(1))
      .subscribe((season) => {
        this.form.get('season').setValue(season.guid);
      });
  }

  public ngOnDestroy(): void {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public fetchSubmissionTypes() {
    this.$submissionTypes = this.submissionTypeService.getEntities();
  }
  /**
   *
   *
   * @memberof UserSubmissionAddEditFormComponent
   */
  public handleSubmission() {
    const form = this.form.getRawValue();

    this.userSubmissionService.createEntity(form).subscribe({
      next: () => {
        this.ns.toast({
          id: 'submission-create-success',
          title: 'Research Submitted Successfully',
          message:
            'Thank you for your submission! The TxGIS Day team will review your submission - you can check the status on your dashboard.'
        });
      },
      error: () => {
        this.ns.toast({
          id: 'submission-create-error',
          title: 'Submission Error',
          message: 'There was an error creating the submission. Please try again later.'
        });
      }
    });
  }

  public deleteEntity() {
    throw new Error('Method not implemented.');
  }

  public addAuthor() {
    (this.form.get('authors') as FormArray).push(this._createAuthor());
  }

  private _createAuthor() {
    return this.fb.group({
      name: [''],
      email: [''],
      studentId: ['']
    });
  }
}

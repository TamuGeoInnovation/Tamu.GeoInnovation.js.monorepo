import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { filter, map, Observable, shareReplay, startWith, Subject, switchMap, take, tap } from 'rxjs';

import { Submission, SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'tamu-gisc-user-submission-add-edit-form',
  templateUrl: './user-submission-add-edit-form.component.html',
  styleUrls: ['./user-submission-add-edit-form.component.scss']
})
export class UserSubmissionAddEditFormComponent implements OnInit, OnDestroy {
  @Input()
  public type: 'create' | 'edit';

  public form: UntypedFormGroup;

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

  public submissionTypeOptions = [
    {
      type: 'presentation',
      label: 'Presentation'
    },
    {
      type: 'paper',
      label: 'Paper'
    },
    {
      type: 'poster',
      label: 'Poster'
    },
    {
      type: 'cartography',
      label: 'Cartography'
    }
  ];

  public entity$: Observable<Partial<Submission>>;
  public submissionTypes$: Observable<Array<Partial<SubmissionType>>>;
  public selectedPresentationFormat$: Observable<string>;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly at: ActivatedRoute,
    private readonly rt: Router,
    private readonly submissionTypeService: SubmissionTypeService,
    private readonly userSubmissionService: UserSubmissionsService,
    private readonly seasonService: SeasonService,
    private readonly ns: NotificationService
  ) {
    this.form = this.fb.group({
      title: [''],
      participants: this.fb.array([]),
      abstract: [''],
      link: [''],
      submissionType: ['presentation'],
      format: ['individual'],
      classificationType: ['undergraduate'],
      season: ['']
    });
  }

  public ngOnInit(): void {
    this.selectedPresentationFormat$ = this.form.get('format').valueChanges.pipe(startWith(this.form.get('format').value));

    // If the `format` changes from group to individual, remove all participants except the first one.
    this.form
      .get('format')
      .valueChanges.pipe()
      .subscribe((format) => {
        if (format === 'individual') {
          while (this._getParticipantsControl().length > 1) {
            this._getParticipantsControl().removeAt(1);
          }
        }
      });

    if (this.type === 'edit') {
      this.entity$ = this.at.params.pipe(
        map((params) => params.guid),
        filter((guid) => guid !== undefined),
        switchMap((guid) => this.userSubmissionService.getEntity(guid)),
        shareReplay(1),
        tap((entity) => {
          if (entity.reviewed) {
            this.form.disable();
          }
        })
      );

      this.entity$.pipe(take(1)).subscribe((entity) => {
        // Form patch will only add the participants if there are a matching number of entries in the form array. Without empty entries, the form array will not be populated.
        // Add each blank participant to participants form array
        while (this._getParticipantsControl().length < entity.participants.length) {
          this.addParticipant();
        }

        this.form.patchValue({
          ...entity
        });

        // If the entity has a season, remove the season control from the form
        this.form.removeControl('season');
      });
    } else {
      this.seasonService
        .getActiveSeason()
        .pipe(take(1))
        .subscribe((season) => {
          this.form.get('season').setValue(season.guid);
        });

      this.addParticipant();
    }
  }

  public ngOnDestroy(): void {
    this._$destroy.next(undefined);
    this._$destroy.complete();
  }

  public handleSubmission() {
    if (this.type === 'create') {
      this._createSubmission();
    } else {
      this._updateSubmission();
    }
  }

  public deleteEntity() {
    this.entity$
      .pipe(
        take(1),
        switchMap((entity) => {
          return this.userSubmissionService.deleteEntity(entity.guid);
        })
      )
      .subscribe({
        next: () => {
          this.ns.toast({
            id: 'submission-delete-success',
            title: 'Student Competition Submission Deleted Successfully',
            message: 'Your submission has been deleted.'
          });

          this.rt.navigate(['/account/submissions']);
        },
        error: () => {
          this.ns.toast({
            id: 'submission-delete-error',
            title: 'Deletion Error',
            message: 'There was an error deleting the submission. Please try again later.'
          });
        }
      });
  }

  public addParticipant() {
    this._getParticipantsControl().push(this._createParticipantGroup());
  }

  private _createSubmission() {
    const form = this.form.getRawValue();

    this.userSubmissionService.createEntity(form).subscribe({
      next: () => {
        this.ns.toast({
          id: 'submission-create-success',
          title: 'Student Competition Submission Successful',
          message:
            'Thank you for your submission! The TxGIS Day team will review your submission - you can check the status on your dashboard.'
        });

        this.rt.navigate(['/account/submissions']);
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

  private _updateSubmission() {
    const form = this.form.getRawValue();

    this.entity$
      .pipe(
        take(1),
        switchMap((entity) => {
          return this.userSubmissionService.updateEntity(entity.guid, form);
        })
      )
      .subscribe({
        next: () => {
          this.ns.toast({
            id: 'submission-update-success',
            title: 'Student Competition Submission Updated Successfully',
            message: 'Your submission has been updated.'
          });

          this.rt.navigate(['/account/submissions']);
        },
        error: () => {
          this.ns.toast({
            id: 'submission-update-error',
            title: 'Update Error',
            message: 'There was an error updating the submission. Please try again later.'
          });
        }
      });
  }

  private _createParticipantGroup(fields: ICompetitionParticipant = { name: '', email: '', studentId: '' }) {
    return this.fb.group({
      name: [fields.name],
      email: [fields.email],
      studentId: [fields.studentId]
    });
  }

  private _getParticipantsControl() {
    return this.form.get('participants') as UntypedFormArray;
  }
}

interface ICompetitionParticipant {
  name: string;
  email: string;
  studentId: string;
}

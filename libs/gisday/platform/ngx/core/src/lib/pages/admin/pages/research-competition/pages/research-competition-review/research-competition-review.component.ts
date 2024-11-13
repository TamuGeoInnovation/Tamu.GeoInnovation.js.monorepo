import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, shareReplay, switchMap } from 'rxjs';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { Submission } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-research-competition-review',
  templateUrl: './research-competition-review.component.html',
  styleUrls: ['./research-competition-review.component.scss']
})
export class ResearchCompetitionReviewComponent implements OnInit {
  public entity$: Observable<Partial<Submission>>;
  public form: FormGroup;

  public reviewOptions = [
    {
      value: 'true',
      label: 'Accept'
    },
    {
      value: 'false',
      label: 'Reject'
    }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly rt: Router,
    private readonly at: ActivatedRoute,
    private readonly submissionService: UserSubmissionsService,
    private readonly ns: NotificationService,
    private readonly ss: SeasonService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      guid: [''],
      acceptance: ['true'],
      message: ['']
    });

    this.entity$ = this.at.params.pipe(
      map((params) => params.guid),
      switchMap((guid) => this.submissionService.getEntity(guid)),
      shareReplay()
    );

    this.entity$.subscribe((entity) => {
      const acceptance = entity.acceptance.toString();

      this.form.patchValue({ guid: entity.guid, acceptance, message: entity.message });
    });
  }

  public deleteEntity() {
    this.submissionService.deleteEntity(this.form.getRawValue().guid).subscribe({
      next: () => {
        this.ns.toast({
          id: 'delete-submission-success',
          title: 'Delete Submission',
          message: 'Submission deleted successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'delete-submission-error',
          title: 'Delete Submission',
          message: `Error deleting submission: ${err.status}`
        });
      }
    });
  }

  public updateSubmission() {
    const rawValue = this.form.getRawValue();

    // `accepted` has been coerced into a string. We need to convert it back to a boolean.
    rawValue.acceptance = rawValue.acceptance === 'true';

    this.submissionService.updateEntity(rawValue.guid, rawValue).subscribe({
      next: () => {
        this.ns.toast({
          id: 'update-submission-success',
          title: 'Update Submission',
          message: 'Submission review submitted successfully.'
        });

        this._navigateBack();
      },
      error: (err) => {
        this.ns.toast({
          id: 'update-submission-error',
          title: 'Update Submission',
          message: `Error inserting submission review: ${err.status}`
        });
      }
    });
  }

  private _navigateBack() {
    this.rt.navigate(['/admin/research-competition']);
  }
}

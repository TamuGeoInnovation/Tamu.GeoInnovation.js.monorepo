import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { combineLatest, map, Observable, shareReplay, startWith } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { Submission, SubmissionWithSubmitter } from '@tamu-gisc/gisday/platform/data-api';
import { UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  SUBMISSION_CLASSIFICATION_OPTIONS,
  SUBMISSION_REVIEW_STATUS,
  SUBMISSION_TYPE_OPTIONS,
  SubmissionReviewStatusPipe
} from '@tamu-gisc/gisday/platform/ngx/common';
import { CheckboxComponent, RadioGroupComponent, SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

/** A submission as the table shows it: with its review status worked out, so the table can sort by it (#2808). */
export type SubmissionRow = Partial<SubmissionWithSubmitter> & { reviewStatus: SUBMISSION_REVIEW_STATUS };

const ALL = { type: '', label: 'All' };

@Component({
  selector: 'tamu-gisc-research-competition-list',
  templateUrl: './research-competition-list.component.html',
  styleUrls: ['./research-competition-list.component.scss'],
  imports: [
    SelectComponent,
    CheckboxComponent,
    RadioGroupComponent,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgClass,
    AsyncPipe,
    DatePipe,
    TitleCasePipe,
    ExistsPipe
  ]
})
export class ResearchCompetitionListComponent extends BaseAdminListComponent<Submission> implements OnInit {
  protected readonly entityService = inject(UserSubmissionsService);
  private readonly nav = inject(Router);
  private readonly here = inject(ActivatedRoute);

  public SubmissionReviewStatus = SUBMISSION_REVIEW_STATUS;

  /** The submission form's own choices (#2807), with All in front. */
  public readonly classificationOptions = [ALL, ...SUBMISSION_CLASSIFICATION_OPTIONS];
  public readonly typeOptions = [ALL, ...SUBMISSION_TYPE_OPTIONS];

  public readonly classification = new FormControl('', { nonNullable: true });
  public readonly type = new FormControl('', { nonNullable: true });

  /** The season's submissions that match the filters, and how many the season has in all. */
  public view$: Observable<{ rows: Array<SubmissionRow>; total: number }>;

  private readonly reviewStatus = new SubmissionReviewStatusPipe();

  public override ngOnInit(): void {
    super.ngOnInit();

    this.view$ = combineLatest([
      this.entitiesForActiveSeasonOrForSeasonGuid$,
      this.classification.valueChanges.pipe(startWith(this.classification.value)),
      this.type.valueChanges.pipe(startWith(this.type.value))
    ]).pipe(
      map(([entities, classification, type]) => {
        const all = entities ?? [];
        const rows = all
          .filter((e) => !classification || e.classificationType === classification)
          .filter((e) => !type || e.submissionType === type)
          .map((e) => ({ ...(e as Partial<SubmissionWithSubmitter>), reviewStatus: this.reviewStatus.transform(e) }));

        return { rows, total: all.length };
      }),
      shareReplay(1)
    );
  }

  /** A click on a row opens it for review; a click in its checkbox only selects it. */
  public onActivate(event: { type: string; row: SubmissionRow; column?: { prop?: unknown } }) {
    if (event.type === 'click' && event.column?.prop !== 'select') {
      this.nav.navigate(['review', event.row.guid], { relativeTo: this.here });
    }
  }
}

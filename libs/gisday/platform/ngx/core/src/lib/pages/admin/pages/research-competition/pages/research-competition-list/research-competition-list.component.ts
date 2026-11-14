import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { combineLatest, map, Observable, shareReplay, startWith, switchMap, take } from 'rxjs';
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
import { downloadFile } from '@tamu-gisc/common/utils/ui';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

/** A submission as the table shows it: with its review status worked out, so the table can sort by it (#2808). */
export type SubmissionRow = Partial<SubmissionWithSubmitter> & { reviewStatus: SUBMISSION_REVIEW_STATUS };

const ALL = { type: '', label: 'All' };

/** All, then those of `options` that at least one submission has in `field` (#2817). */
export function withData(
  options: ReadonlyArray<{ type: string; label: string }>,
  submissions: Array<Partial<Submission>>,
  field: 'classificationType' | 'submissionType'
): Array<{ type: string; label: string }> {
  const present = new Set(submissions.map((s) => s[field]));

  return [ALL, ...options.filter((o) => present.has(o.type))];
}

/** The chosen value if it is still offered; otherwise All, set back on the control without another round. */
function keepIfOffered(control: FormControl<string>, chosen: string, offered: Array<{ type: string }>): string {
  if (chosen && !offered.some((o) => o.type === chosen)) {
    control.setValue('', { emitEvent: false });

    return '';
  }

  return chosen;
}

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

  public readonly classification = new FormControl('', { nonNullable: true });
  public readonly type = new FormControl('', { nonNullable: true });

  /**
   * The season's submissions that match the filters, how many the season has in all, and the filters' choices: All
   * and those of the submission form's own choices (#2807) that the season's submissions have (#2817).
   */
  public view$: Observable<{
    rows: Array<SubmissionRow>;
    total: number;
    classificationOptions: Array<{ type: string; label: string }>;
    typeOptions: Array<{ type: string; label: string }>;
  }>;

  private readonly reviewStatus = new SubmissionReviewStatusPipe();

  public override ngOnInit(): void {
    super.ngOnInit();

    this.view$ = combineLatest([
      this.entitiesForActiveSeasonOrForSeasonGuid$,
      this.classification.valueChanges.pipe(startWith(this.classification.value)),
      this.type.valueChanges.pipe(startWith(this.type.value))
    ]).pipe(
      map(([entities, chosenClassification, chosenType]) => {
        const all = entities ?? [];
        const classificationOptions = withData(SUBMISSION_CLASSIFICATION_OPTIONS, all, 'classificationType');
        const typeOptions = withData(SUBMISSION_TYPE_OPTIONS, all, 'submissionType');

        // A choice the season does not have (after changing season) is not offered, so it goes back to All.
        const classification = keepIfOffered(this.classification, chosenClassification, classificationOptions);
        const type = keepIfOffered(this.type, chosenType, typeOptions);

        const rows = all
          .filter((e) => !classification || e.classificationType === classification)
          .filter((e) => !type || e.submissionType === type)
          .map((e) => ({ ...(e as Partial<SubmissionWithSubmitter>), reviewStatus: this.reviewStatus.transform(e) }));

        return { rows, total: all.length, classificationOptions, typeOptions };
      }),
      shareReplay(1)
    );
  }

  /** Whether the season's zip is being fetched, and why it could not be, if it could not (#2933). */
  public readonly zipping = signal(false);
  public readonly zipProblem = signal<string | null>(null);

  /** Every file the season's submissions have, as one zip, a folder per submission (#2933). */
  public downloadAllFiles() {
    this.zipping.set(true);
    this.zipProblem.set(null);

    this.selectedSeason$
      .pipe(
        take(1),
        switchMap((season) =>
          this.entityService.getSeasonFilesZip(season.guid).pipe(map((zip) => ({ zip, year: season.year })))
        )
      )
      .subscribe({
        next: ({ zip, year }) => {
          this.zipping.set(false);
          downloadFile(zip, `gisday-${year}-submission-files.zip`, 'application/zip');
        },
        error: (err) => {
          this.zipping.set(false);
          this.zipProblem.set(
            err?.status === 404
              ? 'No submission in this season has a file attached yet.'
              : 'The files could not be downloaded.'
          );
        }
      });
  }

  /** A click on a row opens it for review; a click in its checkbox only selects it. */
  public onActivate(event: { type: string; row: SubmissionRow; column?: { prop?: unknown } }) {
    if (event.type === 'click' && event.column?.prop !== 'select') {
      this.nav.navigate(['review', event.row.guid], { relativeTo: this.here });
    }
  }
}

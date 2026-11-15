import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass, AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { combineLatest, EMPTY, filter, map, Observable, shareReplay, startWith, switchMap, take } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { Submission, SubmissionWithSubmitter } from '@tamu-gisc/gisday/platform/data-api';
import {
  SpeakerEditsService,
  UserSubmissionsService,
  finalRemindersToast,
  reviewSubmissionsToast,
  sendEditLinksToast
} from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ReminderSkipReason, hasFinalFile, reminderSkipReason, reminderSkipSummary } from '@tamu-gisc/gisday/common';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { AlertModalComponent, AlertModalData } from '@tamu-gisc/ui-kits/ngx/layout/modal/alert-modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
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
import { SubmissionDeadlinesComponent } from '../../components/submission-deadlines/submission-deadlines.component';
import {
  ReviewEmailModalComponent,
  ReviewEmailModalData,
  ReviewEmailModalResult
} from '../../components/review-email-modal/review-email-modal.component';

/**
 * A submission as the table shows it: with its review status worked out, so the table can sort by it (#2808), and
 * whether its final presentation or poster is uploaded (#3017), likewise.
 */
export type SubmissionRow = Partial<SubmissionWithSubmitter> & {
  reviewStatus: SUBMISSION_REVIEW_STATUS;
  finalFile: 'Uploaded' | 'Missing';
};

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

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

/**
 * What the page asks before approving or rejecting the selected submissions (#2958), in the page: the site cannot use
 * `confirm()`. Every one is emailed, including any already reviewed, so it says how many of those there are.
 */
export function reviewConfirmation(rows: Array<Partial<Submission>>, acceptance: boolean): AlertModalData {
  const verb = acceptance ? 'Approve' : 'Reject';
  const count = rows.length;
  const again = rows.filter((row) => row.reviewed).length;
  const ask =
    count === 1
      ? `${verb} 1 submission and email its submitter?`
      : `${verb} ${count} submissions and email their submitters?`;
  const note = !again
    ? ''
    : count === 1
      ? ' It has already been reviewed; its submitter will be emailed again.'
      : ` ${again} of them ${again === 1 ? 'has' : 'have'} already been reviewed; ${
          again === 1 ? 'its submitter' : 'their submitters'
        } will be emailed again.`;

  return {
    title: `${verb} ${plural(count, 'submission', 'submissions')}`,
    message: ask + note,
    primaryText: `${verb} and email`,
    secondaryText: 'Cancel'
  };
}

/**
 * What the page asks before sending profile emails for the selected submissions (#2958): how many people, each counted
 * once however many submissions they are on.
 */
export function profileEmailConfirmation(rows: Array<Partial<Submission>>): AlertModalData {
  const people = new Set(
    rows.flatMap((row) => (row.participants ?? []).map((p) => (p.email?.trim() || p.name?.trim() || '').toLowerCase()))
  );

  people.delete('');

  return {
    title: 'Send profile emails',
    message: `Send profile emails to the ${plural(people.size, 'person', 'people')} of ${plural(
      rows.length,
      'submission',
      'submissions'
    )}? Each with a speaker record this season gets their own link to update their presenter profile; anyone without one is listed afterwards, not emailed.`,
    primaryText: 'Send',
    secondaryText: 'Cancel'
  };
}

/** Why each of the rows that gets no final reminder is skipped (#3017): not accepted, or a file already. */
export function reminderSkips(rows: Array<Partial<Submission>>): Array<{ reason: ReminderSkipReason }> {
  return rows
    .map((row) => reminderSkipReason(row))
    .filter((reason): reason is ReminderSkipReason => reason !== null)
    .map((reason) => ({ reason }));
}

/**
 * What the final reminder's window says first (#3017): how many of the selection are skipped, and why. Null when every
 * one is, and there is nothing to send.
 */
export function finalReminderNote(rows: Array<Partial<Submission>>): string | null {
  const skipped = reminderSkips(rows);

  if (skipped.length === rows.length) {
    return null;
  }

  return skipped.length === 0
    ? 'Each one selected was accepted and has no file yet; each is reminded.'
    : `${skipped.length} of the ${rows.length} selected ${skipped.length === 1 ? 'is' : 'are'} skipped: ${reminderSkipSummary(skipped)}. Only the rest are reminded.`;
}

/**
 * The narrowest each column of the submissions table may be, in pixels (#3026), each with its cell's 16 px of side
 * padding and a few to spare. Status holds "Pending Review" (bold, 110 px), Type "Presentation" (89 px) and
 * Classification "Undergraduate" (107 px) whole, measured in Playwright; Submitted, its heading, its date and time
 * wrapping between words; the select column, its checkbox clear of the title beside it.
 *
 * Every column but the checkbox's also grows in proportion to its narrowest (its `flexGrow` is the same number), so
 * wherever the table fits, no column is below its narrowest, as the dashboards' table does it (#3006). The table is
 * never drawn narrower than all of them added up: where they do not fit, it scrolls sideways in its own box. Before, it
 * was drawn at its box's width with the columns wider than it, and ngx-datatable pushed the select and Name columns
 * off its left edge.
 */
export const SUBMISSION_TABLE_WIDTHS = {
  select: 56,
  name: 120,
  submitted: 104,
  submittedBy: 130,
  department: 110,
  type: 112,
  format: 100,
  classification: 132,
  finalFile: 100,
  status: 136
} as const;

/** The table's narrowest: every column at its narrowest. */
export const SUBMISSION_TABLE_MIN_WIDTH = Object.values(SUBMISSION_TABLE_WIDTHS).reduce((sum, width) => sum + width, 0);

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
    ExistsPipe,
    SubmissionDeadlinesComponent
  ]
})
export class ResearchCompetitionListComponent extends BaseAdminListComponent<Submission> implements OnInit {
  protected readonly entityService = inject(UserSubmissionsService);
  private readonly nav = inject(Router);
  private readonly here = inject(ActivatedRoute);
  private readonly speakerEdits = inject(SpeakerEditsService);
  private readonly modals = inject(ModalService);
  private readonly toasts = inject(NotificationService);

  public SubmissionReviewStatus = SUBMISSION_REVIEW_STATUS;
  public readonly widths = SUBMISSION_TABLE_WIDTHS;
  public readonly minWidth = SUBMISSION_TABLE_MIN_WIDTH;

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

  /** Its two filters are kept with the search, so the list comes back from a review as it was left (#2942). */
  protected override listFilters() {
    return { ...super.listFilters(), classification: this.classification, type: this.type };
  }

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
          .map((e) => ({
            ...(e as Partial<SubmissionWithSubmitter>),
            reviewStatus: this.reviewStatus.transform(e),
            finalFile: hasFinalFile(e) ? ('Uploaded' as const) : ('Missing' as const)
          }));

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

  /**
   * Approves or rejects the selected submissions at once (#2958), as Submit Review does one: each is recorded and its
   * submitter emailed. Every one sends an email, so the page asks first, saying how many.
   */
  public reviewSelected(acceptance: boolean) {
    this.selectedSubmissions()
      .pipe(
        switchMap((rows) => {
          const guids = rows.map((row) => row.guid);
          // The email is shown, and can be edited, before anything is decided or sent (#2981).
          const data: ReviewEmailModalData = {
            acceptance,
            note: reviewConfirmation(rows, acceptance).message,
            preview: this.entityService.previewReview(guids, acceptance)
          };

          return this.modals.open<ReviewEmailModalResult>(ReviewEmailModalComponent, { data }).pipe(
            filter((templates): templates is Record<string, string> => !!templates),
            switchMap((templates) => this.entityService.review(guids, acceptance, undefined, templates))
          );
        })
      )
      .subscribe({
        next: (result) => {
          this.toasts.toast(reviewSubmissionsToast(result, acceptance));
          // The list shows each one's new status.
          this.$signal.next(true);
        },
        error: () =>
          this.toasts.toast({
            id: 'submission-review',
            title: `Submissions not ${acceptance ? 'approved' : 'rejected'}`,
            message: 'Please try again.'
          })
      });
  }

  /**
   * Emails each person of the selected submissions their own link to their presenter profile (#2958), as the Speakers
   * list's action does: each is matched to the season's speaker records by email, and anyone with none is listed.
   */
  public sendProfileEmails() {
    this.selectedSubmissions()
      .pipe(
        switchMap((rows) =>
          this.modals.open<boolean>(AlertModalComponent, { data: profileEmailConfirmation(rows) }).pipe(
            filter(Boolean),
            switchMap(() => this.speakerEdits.sendForSubmissions(rows.map((row) => row.guid)))
          )
        )
      )
      .subscribe({
        next: (result) => this.toasts.toast(sendEditLinksToast(result)),
        error: () =>
          this.toasts.toast({ id: 'speaker-edit-links', title: 'Profile emails not sent', message: 'Please try again.' })
      });
  }

  /**
   * Emails the final reminder to the selected accepted submissions that have no file yet (#3017), by the review's own
   * window: the email shown and editable first, saying how many are skipped and why. Nothing opens when every one
   * selected is skipped.
   */
  public sendFinalReminders() {
    this.selectedSubmissions()
      .pipe(
        switchMap((rows) => {
          const note = finalReminderNote(rows);

          if (note === null) {
            this.toasts.toast({
              id: 'final-reminder',
              title: 'No final reminder sent',
              message: `Nothing to send: ${reminderSkipSummary(reminderSkips(rows))}.`
            });

            return EMPTY;
          }

          const guids = rows.map((row) => row.guid);
          const data: ReviewEmailModalData = {
            verb: 'Send final reminder',
            note,
            preview: this.entityService.previewReminders(guids)
          };

          return this.modals.open<ReviewEmailModalResult>(ReviewEmailModalComponent, { data }).pipe(
            filter((templates): templates is Record<string, string> => !!templates),
            switchMap((templates) => this.entityService.remind(guids, templates))
          );
        })
      )
      .subscribe({
        next: (result) => this.toasts.toast(finalRemindersToast(result)),
        error: () =>
          this.toasts.toast({ id: 'final-reminder', title: 'Final reminders not sent', message: 'Please try again.' })
      });
  }

  /** The selected submissions, in the order they were selected. */
  private selectedSubmissions(): Observable<Array<SubmissionRow>> {
    return combineLatest([this.selectedRows$, this.view$]).pipe(
      take(1),
      map(([guids, view]) =>
        guids.map((guid) => view.rows.find((row) => row.guid === guid)).filter((row): row is SubmissionRow => !!row)
      )
    );
  }

  /** A click on a row opens it for review; a click in its checkbox only selects it. */
  public onActivate(event: { type: string; row: SubmissionRow; column?: { prop?: unknown } }) {
    if (event.type === 'click' && event.column?.prop !== 'select') {
      this.nav.navigate(['review', event.row.guid], { relativeTo: this.here });
    }
  }
}

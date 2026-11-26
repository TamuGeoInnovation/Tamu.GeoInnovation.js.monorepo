import { Component, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { filter, map, Observable, shareReplay, startWith, switchMap, take, tap } from 'rxjs';

import { Submission, SubmissionType } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SubmissionTypeService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { RadioGroupComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { SlideToggleComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';

import { SubmissionFilesComponent } from '../../../../submission-files/submission-files.component';
import { deadlineNotice } from '../../../../../utils/submission-deadline-notice';
import { runsCompetition } from '@tamu-gisc/gisday/common';
import { serverMessage } from '../../../../../utils/server-message';
import { GISDAY_SITE } from '../../../../../site/site';
import {
  SUBMISSION_CLASSIFICATION_OPTIONS,
  SUBMISSION_FORMAT_OPTIONS,
  SUBMISSION_TYPE_OPTIONS
} from '../../../../../enums/submission-options';

@Component({
  selector: 'tamu-gisc-user-submission-add-edit-form',
  templateUrl: './user-submission-add-edit-form.component.html',
  styleUrls: ['./user-submission-add-edit-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RadioGroupComponent,
    SlideToggleComponent,
    TextboxComponent,
    ButtonComponent,
    AsyncPipe,
    SubmissionFilesComponent
  ]
})
export class UserSubmissionAddEditFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly at = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly rt = inject(Router);
  private readonly submissionTypeService = inject(SubmissionTypeService);
  private readonly userSubmissionService = inject(UserSubmissionsService);
  private readonly seasonService = inject(SeasonService);
  private readonly ns = inject(NotificationService);
  /** The site's own name for the text (#2968): Texas A&M GIS Day on Texas A&M's site, not TxGIS Day. */
  public readonly site = inject(GISDAY_SITE);

  public readonly type = input.required<'create' | 'edit'>();

  public form: UntypedFormGroup;

  /**
   * The participant controls, as a new list whenever one is added or removed.
   */
  public readonly participants = signal<Array<AbstractControl>>([]);

  // Shared with the admin list's filters (#2807).
  public presentationStudentTypeOptions = [...SUBMISSION_CLASSIFICATION_OPTIONS];

  public presentationFormatOptions = [...SUBMISSION_FORMAT_OPTIONS];

  /**
   * The competitions offered: those the season runs (#2948), and the one a submission was saved to, which stays its own
   * when that competition is later turned off.
   */
  public readonly submissionTypeOptions = computed(() =>
    SUBMISSION_TYPE_OPTIONS.filter(({ type }) => runsCompetition(this.season(), type) || type === this.savedType())
  );

  public entity$: Observable<Partial<Submission>>;
  public submissionTypes$: Observable<Array<Partial<SubmissionType>>>;
  public selectedPresentationFormat$: Observable<string>;

  /** The season the submission is (or will be) in: its own when editing, the active one when creating (#2934). */
  private readonly season = signal<Partial<Submission['season']> | null>(null);

  /** The competition the submission was saved to, whose deadlines hold its edits and files. */
  private readonly savedType = signal<string | null>(null);

  /** The competition chosen in the form. */
  private readonly chosenType: () => string;

  /**
   * When the chosen competition stops taking submissions, or that it has (#2934). The API refuses a submission or edit
   * after it; the page says so first, and offers no Submit or Update.
   */
  public readonly submissionsNotice = computed(() => deadlineNotice(this.season(), this.chosenType(), 'submissions'));

  /** When the saved submission's files close, or that they have: later than the submission itself. */
  public readonly filesNotice = computed(() => deadlineNotice(this.season(), this.savedType(), 'files'));

  constructor() {
    this.form = this.fb.group({
      title: [''],
      participants: this.fb.array([]),
      // The other authors, one per line, and their emails in the same order (#2990). Saved as participants after the
      // submitter, so the stored submission and the review email are as before.
      coAuthors: [''],
      coAuthorEmails: [''],
      abstract: [''],
      link: [''],
      submissionType: ['presentation'],
      format: ['individual'],
      classificationType: ['undergraduate'],
      season: ['']
    });

    this.chosenType = toSignal(this.form.controls.submissionType.valueChanges, {
      initialValue: this.form.controls.submissionType.value
    });

    // A saved submission whose competition has closed can no longer be edited, as a reviewed one cannot.
    effect(() => {
      if (deadlineNotice(this.season(), this.savedType(), 'submissions')?.closed) {
        this.form.disable();
      }
    });
  }

  public ngOnInit(): void {
    this.selectedPresentationFormat$ = this.form.controls.format.valueChanges.pipe(
      startWith(this.form.controls.format.value)
    );

    // If the `format` changes from group to individual, remove all participants except the first one.
    this.form.controls.format.valueChanges.subscribe((format) => {
      if (format === 'individual') {
        while (this._getParticipantsControl().length > 1) {
          this._getParticipantsControl().removeAt(1);
        }

        this.form.patchValue({ coAuthors: '', coAuthorEmails: '' });
        this._syncParticipants();
      }
    });

    if (this.type() === 'edit') {
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
        while (this._getParticipantsControl().length < (entity.participants?.length ?? 0)) {
          this.addParticipant();
        }

        this.form.patchValue({
          ...entity
        });

        // Everyone after the submitter goes into the co-author boxes, one per line (#2990); the form keeps one row, theirs.
        const others = (entity.participants ?? []).slice(1);

        this.form.patchValue({
          coAuthors: others.map((p) => p?.name ?? '').join('\n'),
          coAuthorEmails: others.map((p) => p?.email ?? '').join('\n')
        });

        while (this._getParticipantsControl().length > 1) {
          this._getParticipantsControl().removeAt(1);
        }

        this._syncParticipants();
        this._submitterFromAccount();

        // If the entity has a season, remove the season control from the form
        this.form.removeControl('season');

        this.season.set(entity.season ?? null);
        this.savedType.set(entity.submissionType ?? null);
      });
    } else {
      this.seasonService
        .getActiveSeason()
        .pipe(take(1))
        .subscribe((season) => {
          this.season.set(season);

          // With no active season, the form's season is left empty.
          if (season) {
            this.form.controls.season.setValue(season.guid);
          }

          // The form starts on Presentation; when this season does not run it, on the first competition it does (#2948).
          const offered = this.submissionTypeOptions();

          if (offered.length > 0 && !offered.some(({ type }) => type === this.form.controls.submissionType.value)) {
            this.form.controls.submissionType.setValue(offered[0].type);
          }
        });

      this.addParticipant();
      this._submitterFromAccount();
    }
  }

  public handleSubmission() {
    if (this.type() === 'create') {
      this._createSubmission();
    } else {
      this._updateSubmission();
    }
  }

  public deleteEntity() {
    this.entity$
      .pipe(
        take(1),
        map((entity) => entity.guid),
        // Only a saved submission, which has a guid, can be deleted.
        filter((guid): guid is string => Boolean(guid)),
        switchMap((guid) => this.userSubmissionService.deleteEntity(guid))
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
    this._syncParticipants();
  }

  private _createSubmission() {
    const form = this._withCoAuthors(this.form.getRawValue());

    this.userSubmissionService.createEntity(form).subscribe({
      next: () => {
        this.ns.toast({
          id: 'submission-create-success',
          title: 'Student Competition Submission Successful',
          message: `Thank you for your submission! The ${this.site.name} team will review your submission - you can check the status on your dashboard.`
        });

        this.rt.navigate(['/account/submissions']);
      },
      error: (err) => {
        this.ns.toast({
          id: 'submission-create-error',
          title: 'Submission Error',
          message: serverMessage(err, 'There was an error creating the submission. Please try again later.')
        });
      }
    });
  }

  private _updateSubmission() {
    const form = this._withCoAuthors(this.form.getRawValue());

    this.entity$
      .pipe(
        take(1),
        map((entity) => entity.guid),
        // Only a saved submission, which has a guid, can be updated.
        filter((guid): guid is string => Boolean(guid)),
        switchMap((guid) => this.userSubmissionService.updateEntity(guid, form))
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
        error: (err) => {
          this.ns.toast({
            id: 'submission-update-error',
            title: 'Update Error',
            message: serverMessage(err, 'There was an error updating the submission. Please try again later.')
          });
        }
      });
  }

  // No student ID: the Entra and TAMU directory lookup gives it, from the email (#2990). A saved submission's stays.
  private _createParticipantGroup(fields: ICompetitionParticipant = { name: '', email: '' }) {
    return this.fb.group({
      name: [fields.name],
      email: [fields.email]
    });
  }

  /**
   * The form's values as the API takes them (#2990): the submitter, then each co-author, a line of the names box paired
   * with the same line of the emails box. Blank lines are left out; a name with no email, or an email with no name, is
   * kept with the other empty.
   */
  private _withCoAuthors(form: Record<string, unknown>) {
    const lines = (text: unknown) => `${text ?? ''}`.split(/\r?\n/).map((line) => line.trim());
    const names = lines(form['coAuthors']);
    const emails = lines(form['coAuthorEmails']);
    const others = Array.from({ length: Math.max(names.length, emails.length) }, (_, i) => ({
      name: names[i] ?? '',
      email: (emails[i] ?? '').toLowerCase()
    })).filter((p) => p.name || p.email);
    const submitter = ((form['participants'] as Array<ICompetitionParticipant>) ?? [])[0];
    const { coAuthors: _coAuthors, coAuthorEmails: _coAuthorEmails, ...rest } = form;

    return { ...rest, participants: [...(submitter ? [submitter] : []), ...(form['format'] === 'group' ? others : [])] };
  }

  /**
   * The submitter is the signed-in account: their name and email come from it and cannot be typed (#2990). Typed, they
   * disagreed with the account (an address no directory knew; a test address), and the review email went to the typed
   * one. Any other member of a group is still typed.
   */
  private _submitterFromAccount() {
    this.auth.user$.pipe(take(1)).subscribe((user) => {
      const submitter = this._getParticipantsControl().at(0);
      const name =
        [user?.given_name, user?.family_name].filter((part) => `${part ?? ''}`.trim()).join(' ') || user?.name || '';

      if (!submitter || !user?.email) {
        return;
      }

      submitter.patchValue({ name: name.trim(), email: `${user.email}`.trim().toLowerCase() });
      submitter.get('name')?.disable();
      submitter.get('email')?.disable();
    });
  }

  private _getParticipantsControl() {
    return this.form.get('participants') as UntypedFormArray;
  }

  private _syncParticipants() {
    this.participants.set([...this._getParticipantsControl().controls]);
  }
}

interface ICompetitionParticipant {
  name: string;
  email: string;
  studentId?: string;
}

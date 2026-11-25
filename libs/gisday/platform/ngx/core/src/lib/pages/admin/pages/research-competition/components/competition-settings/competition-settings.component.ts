import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import {
  DEADLINE_COMPETITION_TABLE,
  DeadlineCompetition,
  DeadlineKind,
  SEASON_COMPETITIONS,
  SUBMISSION_DEADLINE_FIELDS,
  SubmissionDeadlineField,
  CompetitionSettingsInput,
  asDate,
  competitionSettings,
  competitionSettingsProblem,
  competitionTypesProblem,
  deadlineField,
  deadlinesProblem,
  inCentralTime,
  runsCompetition
} from '@tamu-gisc/gisday/common';
import { ButtonComponent, CheckboxComponent, SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';
import { AccordionContentDirective, AccordionDirective, AccordionHeaderDirective } from '@tamu-gisc/ui-kits/ngx/layout';

type CompetitionsForm = FormGroup<Record<DeadlineCompetition, FormControl<boolean>>>;
type DeadlinesForm = FormGroup<Record<SubmissionDeadlineField, FormControl<Date | string | null>>>;

/** One competition's sessions and finalists date (#3019): a session's id, or empty to find it by its name. */
type SessionsRow = FormGroup<{
  sessionGuid: FormControl<string>;
  graduateSessionGuid: FormControl<string>;
  awardsSessionGuid: FormControl<string>;
  finalistsNotifiedAt: FormControl<Date | string | null>;
}>;

/** The empty choice of a session: the pages and emails find it by its `COMPETITION:` or `AWARDS:` name, as before. */
const BY_NAME = { guid: '', name: 'By its name (COMPETITION: / AWARDS:)' };

function sessionsRow(): SessionsRow {
  return new FormGroup({
    sessionGuid: new FormControl('', { nonNullable: true }),
    graduateSessionGuid: new FormControl('', { nonNullable: true }),
    awardsSessionGuid: new FormControl('', { nonNullable: true }),
    finalistsNotifiedAt: new FormControl<Date | string | null>(null)
  });
}

/** What one half of a save came to: null when it was saved, or why it was not. */
type Refusal = string | null;

/** "Poster, presentation and paper": the competitions' names in a sentence. */
function inASentence(names: ReadonlyArray<string>): string {
  return names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Why the API refused a save, in its words when it gave any. */
function refusal(err: unknown, otherwise: string): string {
  const message = (err as { error?: { message?: unknown } })?.error?.message;

  return typeof message === 'string' ? message : otherwise;
}

/**
 * A season's competition settings (#3037), set by the admins on the competitions' page: which research competitions it
 * runs (#2948), and when each running one closes, poster and presentation (#2934), paper and cartography (#2962). One
 * Save sends both.
 *
 * Which it runs: the submission form offers only those, and the API refuses a new submission to any other. A
 * submission already made to a competition turned off stays as it is, and is still listed on the page.
 *
 * Deadlines: for each competition, when new submissions and edits close, and when, later, the files attached to them
 * do. Empty leaves it open. The API enforces them; the student's submission page shows them. Entered and shown as the
 * scoring window is (#2474): the picker, and under it the moment in Central time whatever the admin's computer is set
 * to. A competition turned off keeps whatever deadlines it had, so turning it on again brings them back.
 *
 * A panel (#2969), on the shared accordion: collapsed to a one-line summary once the season has deadlines, so the
 * submissions below it are what the page opens on, and open to edit when it has none.
 */
@Component({
  selector: 'tamu-gisc-competition-settings',
  templateUrl: './competition-settings.component.html',
  styleUrls: ['./competition-settings.component.scss'],
  imports: [
    ReactiveFormsModule,
    ButtonComponent,
    CheckboxComponent,
    SelectComponent,
    DateTimePickerComponent,
    AccordionDirective,
    AccordionHeaderDirective,
    AccordionContentDirective
  ]
})
export class CompetitionSettingsComponent {
  private readonly seasons = inject(SeasonService);
  private readonly events = inject(EventService);

  /** The season whose settings are shown: the one the page's season picker has chosen. */
  public readonly season = input<Partial<Season> | null>(null);

  /** A box for every competition, in the competitions table's order (#2962). */
  public readonly allCompetitions = DEADLINE_COMPETITION_TABLE.map(({ competition, label }) => ({
    key: competition,
    label
  }));

  public readonly kinds: ReadonlyArray<{ kind: DeadlineKind; label: string }> = [
    { kind: 'submissions', label: 'Submissions and edits close' },
    { kind: 'files', label: 'File uploads close' }
  ];

  public readonly form = new FormGroup({
    competitions: new FormGroup(
      Object.fromEntries(
        SEASON_COMPETITIONS.map((competition) => [competition, new FormControl(true, { nonNullable: true })])
      ) as Record<DeadlineCompetition, FormControl<boolean>>
    ) as CompetitionsForm,
    deadlines: new FormGroup(
      Object.fromEntries(
        SUBMISSION_DEADLINE_FIELDS.map((field) => [field, new FormControl<Date | string | null>(null)])
      ) as Record<SubmissionDeadlineField, FormControl<Date | string | null>>
    ) as DeadlinesForm,
    sessions: new FormGroup(
      Object.fromEntries(SEASON_COMPETITIONS.map((competition) => [competition, sessionsRow()])) as Record<
        DeadlineCompetition,
        SessionsRow
      >
    )
  });

  /**
   * The season's sessions to choose from (#3019), by name, after the choice to find one by its name. Empty while they
   * load, or if they cannot be read.
   */
  public readonly sessionChoices = toSignal(
    toObservable(this.season).pipe(
      switchMap((season) =>
        season?.guid
          ? this.events.getEntitiesForSeason(season.guid).pipe(
              map((events) =>
                [...events]
                  .map((event) => ({ guid: event.guid as string, name: event.name ?? 'Untitled session' }))
                  .sort((a, b) => a.name.localeCompare(b.name))
              ),
              catchError(() => of([]))
            )
          : of([])
      ),
      map((events) => [BY_NAME, ...events])
    ),
    { initialValue: [BY_NAME] }
  );

  /** The competitions whose pages name their sessions (#3011, #3019): a session to choose for each. */
  public readonly withSessions: ReadonlyArray<DeadlineCompetition> = ['poster', 'presentation'];

  /** Whether the panel is open to edit. Set from the season each time one is chosen; the header toggles it. */
  public readonly expanded = signal(true);

  private readonly values = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** The competitions ticked, as the form holds them: a row of deadlines for each, and named in the summary. */
  public readonly competitions = computed(() => {
    const ticked = this.values().competitions ?? {};

    return this.allCompetitions.filter(({ key }) => ticked[key]);
  });

  /**
   * The panel's line while collapsed (#2969, #3037): the competitions run, then each one's deadlines as the form holds
   * them, in brief, with the zone named once. "Poster and paper competitions. Poster closes Fri, Nov 13, 5:00 PM; files
   * Mon, Nov 16, 12:00 PM · Paper open (Central time)"
   */
  public readonly summary = computed(() => {
    const deadlines = this.values().deadlines ?? {};
    const running = this.competitions();
    const named = inASentence(running.map(({ key }) => key));
    const runs = running.length ? `${named[0].toUpperCase()}${named.slice(1)} competitions.` : 'No competitions.';

    if (
      running.every(({ key }) => (['submissions', 'files'] as const).every((k) => !asDate(deadlines[deadlineField(key, k)])))
    ) {
      return `${runs} No deadlines set: each is open.`;
    }

    const brief = (field: SubmissionDeadlineField) => inCentralTime(deadlines[field], '', { brief: true });
    const lines = running.map(({ key }) => {
      const name = `${key[0].toUpperCase()}${key.slice(1)}`;
      const submissions = brief(deadlineField(key, 'submissions'));
      const files = brief(deadlineField(key, 'files'));

      return `${name} ${submissions ? `closes ${submissions}` : 'open'}${files ? `; files ${files}` : ''}`;
    });

    return `${runs} ${lines.join(' · ')} (Central time)`;
  });

  public readonly saving = signal(false);

  /** What became of the last save: saved, or which half was not and why. */
  public readonly result = signal<{ saved: boolean; text: string } | null>(null);

  public readonly deadlineField = deadlineField;
  public readonly inCentralTime = inCentralTime;

  /** The season the form was last filled from, to tell another season chosen from this one read again. */
  private shownGuid: string | null | undefined = undefined;

  constructor() {
    // Another season chosen: the form shows what it holds, collapsed to its summary if it holds any deadline and open
    // to set them if it holds none. This one read again after a save: the form shows what it now holds, unless
    // something typed was not saved, which stays in the form to correct and save again; either way the panel stays
    // open, so what became of the save can be read (#3037).
    effect(() => {
      const season = this.season();
      const another = (season?.guid ?? null) !== this.shownGuid;

      if (!another && this.form.dirty) {
        return;
      }

      this.shownGuid = season?.guid ?? null;

      const deadlines = Object.fromEntries(
        SUBMISSION_DEADLINE_FIELDS.map((field) => [field, asDate(season?.[field])])
      ) as Record<SubmissionDeadlineField, Date | null>;
      const competitions = Object.fromEntries(
        SEASON_COMPETITIONS.map((competition) => [competition, runsCompetition(season, competition)])
      ) as Record<DeadlineCompetition, boolean>;

      const sessions = Object.fromEntries(
        SEASON_COMPETITIONS.map((competition) => {
          const row = competitionSettings(season, competition);

          return [
            competition,
            {
              sessionGuid: row?.sessionGuid ?? '',
              graduateSessionGuid: row?.graduateSessionGuid ?? '',
              awardsSessionGuid: row?.awardsSessionGuid ?? '',
              finalistsNotifiedAt: asDate(row?.finalistsNotifiedAt)
            }
          ];
        })
      );

      this.form.reset({ competitions, deadlines, sessions });

      if (another) {
        this.expanded.set(Object.values(deadlines).every((deadline) => deadline === null));
        this.result.set(null);
      }
    });
  }

  /** Empties one deadline: that side stays open. */
  public clear(field: SubmissionDeadlineField): void {
    const control = this.form.controls.deadlines.controls[field];

    control.setValue(null);
    control.markAsDirty();
  }

  /** Empties a competition's finalists date: its page then leaves the line out (#3019). */
  public clearFinalists(competition: DeadlineCompetition): void {
    const control = this.form.controls.sessions.controls[competition].controls.finalistsNotifiedAt;

    control.setValue(null);
    control.markAsDirty();
  }

  /**
   * The competitions' settings to send (#3019): each that has one, or had one, so emptying a choice is saved and a
   * competition never given one gets no row.
   */
  private settingsToSend(): Array<CompetitionSettingsInput> {
    const season = this.season();

    return SEASON_COMPETITIONS.flatMap((competitionType) => {
      const value = this.form.controls.sessions.controls[competitionType].getRawValue();
      const row: CompetitionSettingsInput = {
        competitionType,
        sessionGuid: value.sessionGuid || null,
        graduateSessionGuid: value.graduateSessionGuid || null,
        awardsSessionGuid: value.awardsSessionGuid || null,
        finalistsNotifiedAt: asDate(value.finalistsNotifiedAt)?.toISOString() ?? null
      };
      const any = row.sessionGuid || row.graduateSessionGuid || row.awardsSessionGuid || row.finalistsNotifiedAt;

      return any || competitionSettings(season, competitionType) ? [row] : [];
    });
  }

  /** Sends the competitions and the deadlines together, and says which, if either, was refused. */
  public save(): void {
    const season = this.season();

    if (!season?.guid) {
      return;
    }

    const chosen = SEASON_COMPETITIONS.filter((competition) => this.form.controls.competitions.controls[competition].value);
    const deadlines = Object.fromEntries(
      SUBMISSION_DEADLINE_FIELDS.map((field) => [
        field,
        asDate(this.form.controls.deadlines.controls[field].value)?.toISOString() ?? null
      ])
    );

    const settings = this.settingsToSend();

    // Checked here first, as the API checks them: if any would be refused, none is sent.
    const problems = [
      competitionTypesProblem(chosen),
      deadlinesProblem(deadlines),
      competitionSettingsProblem(settings)
    ].filter((p): p is string => !!p);

    if (problems.length) {
      this.result.set({ saved: false, text: `Nothing was saved. ${problems.join(' ')}` });

      return;
    }

    const sent = (save: Observable<unknown>, otherwise: string): Observable<Refusal> =>
      save.pipe(
        map(() => null),
        catchError((err) => of(refusal(err, otherwise)))
      );

    this.saving.set(true);
    this.result.set(null);

    // The sessions after the competitions: both write the season's rows of competitions (#3019).
    const competitionsThenSessions = sent(
      this.seasons.setCompetitionTypes(season.guid, chosen),
      'The competitions could not be saved.'
    ).pipe(
      switchMap((competitions) =>
        (settings.length
          ? sent(this.seasons.setCompetitionSettings(season.guid, settings), 'The sessions could not be saved.')
          : of(null)
        ).pipe(map((sessions) => ({ competitions, sessions })))
      )
    );

    forkJoin([
      competitionsThenSessions,
      sent(this.seasons.setSubmissionDeadlines(season.guid, deadlines), 'The deadlines could not be saved.')
    ]).subscribe(([{ competitions, sessions }, deadlinesRefused]) => {
      this.saving.set(false);

      if (sessions) {
        this.result.set({ saved: false, text: `The sessions and finalists dates were not saved: ${sessions}` });
      } else if (!competitions && !deadlinesRefused) {
        // All of it saved: the season read again fills the form from what it now holds.
        this.form.markAsPristine();
        this.result.set({ saved: true, text: 'Competitions and deadlines saved.' });
      } else if (competitions && deadlinesRefused) {
        this.result.set({
          saved: false,
          text: `Neither was saved. The competitions: ${competitions} The deadlines: ${deadlinesRefused}`
        });
      } else if (competitions) {
        this.result.set({ saved: false, text: `The deadlines were saved. The competitions were not: ${competitions}` });
      } else {
        this.result.set({ saved: false, text: `The competitions were saved. The deadlines were not: ${deadlinesRefused}` });
      }
    });
  }
}

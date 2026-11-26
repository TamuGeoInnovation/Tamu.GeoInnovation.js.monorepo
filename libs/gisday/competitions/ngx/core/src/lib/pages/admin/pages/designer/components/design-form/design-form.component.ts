import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize, shareReplay, switchMap } from 'rxjs/operators';

import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { asDate, inCentralTime } from '@tamu-gisc/gisday/common';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { readRefusal, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DateTimePickerComponent } from '@tamu-gisc/ui-kits/ngx/forms/date-time-picker';
import { DesignQuestionComponent } from '../design-question/design-question.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    ButtonComponent,
    CheckboxComponent,
    DateTimePickerComponent,
    DesignQuestionComponent
  ]
})
export class DesignFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly fs = inject(FormService);
  private readonly ns = inject(NotificationService);

  public currentSeasonForm$: Observable<CompetitionSeason | null>;
  public loadSchemaForm: UntypedFormGroup;

  /** Whether Fetch Schema is waiting for its answer; it cannot be pressed again until then (#2582). */
  public readonly fetching = signal(false);

  /** What the last Fetch Schema found, or why it failed (#2582). */
  public readonly fetchResult = signal<{ found?: string; failed?: string } | null>(null);

  // A real, empty form from the start, which ngOnInit then sets as it always has: nothing reads it before (#3614).
  public readonly formModel = signal<UntypedFormGroup>(this.emptyFormModel());

  /**
   * The questions in the form, as a new list whenever one is added or removed.
   */
  public readonly fields = signal<Array<AbstractControl>>([]);

  /** The form a season with none yet starts from. */
  private emptyFormModel(): UntypedFormGroup {
    return this.fb.group({
      fields: this.fb.array([]),
      allowSubmissions: [false],
      scoringOpensAt: [null],
      scoringClosesAt: [null]
    });
  }

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
    });

    this.formModel.set(this.emptyFormModel());

    this.currentSeasonForm$ = this.fs.getFormForActiveSeason().pipe(
      catchError(() => {
        return of(null);
      }),
      shareReplay()
    );

    this.currentSeasonForm$.subscribe((res) => {
      if (res && res.form && res.form.source) {
        this.loadSchemaForm.patchValue({ source: res.form.source });
      }

      const model = res?.form?.model;

      if (res && model) {
        this.formModel.set(
          this.fb.group({
            allowSubmissions: [res.allowSubmissions],
            scoringOpensAt: [asDate(res.scoringOpensAt)],
            scoringClosesAt: [asDate(res.scoringClosesAt)],
            fields: this.fb.array(
              model.map((q) => {
                // A question saved without its options opens with none, where reading their length threw and the
                // designer stayed empty (#3614).
                return this.fb.group({ ...q, options: this.fb.array(q.options ?? []) });
              })
            )
          })
        );
        this._syncFields();
      }
    });
  }

  /**
   * Reads a form file or an ArcGIS layer's fields and makes a question of each. Says it is working while it waits, and
   * then what it found or why it could not (#2582): it used to say nothing either way.
   */
  public getSchema() {
    if (this.fetching()) {
      return;
    }

    const r = this.loadSchemaForm.getRawValue();

    this.fetching.set(true);
    this.fetchResult.set(null);

    this.http
      .get<IEsriRestLayerSchema>(r.source)
      .pipe(finalize(() => this.fetching.set(false)))
      .subscribe({
        next: (schema) => {
          // ArcGIS refuses inside a successful answer: `{ error: { code: 499, message: 'Token Required' } }`.
          if (schema?.error) {
            this.fetchResult.set({
              failed: `The layer refused: ${schema.error.message}. The Designer can read only a public layer.`
            });
            return;
          }

          if (!Array.isArray(schema?.fields)) {
            this.fetchResult.set({
              failed: "That address has no fields to make a form from. Use a form file or an ArcGIS layer's address."
            });
            return;
          }

          this._useFields(schema.fields);
          this.fetchResult.set({
            found: `Found ${schema.fields.length} fields: ${schema.fields
              .map((f) => f.alias || f.name)
              .join(', ')}. Each is a question below; review them, then Save.`
          });
        },
        error: (err) => {
          // Status 0: the browser did not let the page read it, most often another site's file without CORS headers.
          const failed =
            err?.status === 0
              ? "Couldn't load that address. Use a form file on this site (/assets/competitions/...) or a public ArcGIS layer."
              : serverMessage(err, `Couldn't load that address: it answered ${err?.status}.`);

          this.fetchResult.set({ failed });
        }
      });
  }

  /** Makes the form's questions from a schema's fields, in place of those it had. */
  private _useFields(fields: Array<Field>) {
    const controls = fields.reduce((arr, field) => {
      // Create an array of controls for the question options from the domain coded values, if any.
      const options =
        field.domain && field.domain.codedValues !== null
          ? this.fb.array(
              field.domain.codedValues.map((cv) => {
                // Keeps anything else the coded value carries, such as the type question's scoring
                // settings (sameThingMetres, nameAttribute, earlier; #2162).
                const { name, code, ...settings } = cv as esri.CodedValue & Record<string, unknown>;

                return this.fb.control({ ...settings, name, value: code });
              })
            )
          : this.fb.array([]);

      const type = options.length === 0 ? 'text' : 'select';

      const groupControl = this.fb.group({
        attribute: [field.name],
        title: [`${field.alias}`],
        instructions: [''],
        enabled: [true],
        isDiscriminator: [false],
        options: options,
        type: [type]
      });

      return [...arr, groupControl];
    }, []);

    const fieldsArray = this.formModel().get('fields') as UntypedFormArray;
    fieldsArray.clear();
    controls.forEach((control) => {
      fieldsArray.push(control);
    });
    this._syncFields();
  }

  /**
   * A moment of the scoring window as GIS Day's own clock reads it, so an admin sees the Central time saved
   * whatever their computer is set to (#2474). "No limit" when it is empty. Shared with the submission deadlines (#2934).
   */
  public readonly inCentralTime = inCentralTime;

  /** Empties one side of the scoring window: no limit on that side. */
  public clearScoringMoment(control: 'scoringOpensAt' | 'scoringClosesAt'): void {
    this.formModel().get(control)?.setValue(null);
  }

  public removeQuestion(index: number) {
    const fieldsArray = this.formModel().get('fields') as UntypedFormArray;
    fieldsArray.removeAt(index);
    this._syncFields();
  }

  public saveForm(): void {
    const sourceForm = this.loadSchemaForm.getRawValue();
    const modelForm = this.formModel().getRawValue();
    const fields = modelForm.fields;

    const payload = {
      form: {
        source: sourceForm.source,
        model: [...fields]
      },
      season: {
        allowSubmissions: modelForm.allowSubmissions,
        scoringOpensAt: asDate(modelForm.scoringOpensAt)?.toISOString() ?? null,
        scoringClosesAt: asDate(modelForm.scoringClosesAt)?.toISOString() ?? null
      }
    };

    this.currentSeasonForm$
      .pipe(
        switchMap((season) => {
          // A season whose form is not made yet gets one made, where reading its guid threw and nothing was saved
          // (#3614).
          if (season?.form) {
            return this.fs.updateForm(season.form.guid, payload);
          } else {
            return this.fs.createFormModelForActiveSeason(payload);
          }
        })
      )
      .subscribe({
        // Save said nothing either way (#2582).
        next: () => this.ns.toast({ id: 'designer-saved', title: 'Saved', message: 'The form is saved.' }),
        error: (err) =>
          this.ns.toast({
            id: 'designer-not-saved',
            title: "Couldn't save",
            message: readRefusal(err) ?? serverMessage(err, 'The form could not be saved. Please try again.')
          })
      });
  }

  private _syncFields() {
    this.fields.set([...(this.formModel().get('fields') as UntypedFormArray).controls]);
  }
}

interface IEsriRestLayerSchema {
  fields?: Array<Field>;
  /** How ArcGIS refuses, inside a successful answer. */
  error?: { code?: number; message?: string };
}

export interface Field extends esri.Field {
  domain: esri.CodedValueDomain;
}

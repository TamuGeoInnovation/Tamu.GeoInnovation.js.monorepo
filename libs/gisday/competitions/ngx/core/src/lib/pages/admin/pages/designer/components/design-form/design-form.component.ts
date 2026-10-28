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
import { catchError, map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
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

  public currentSeasonForm$: Observable<CompetitionSeason>;
  public urlFields$: Observable<Array<Field>>;
  public loadSchemaForm: UntypedFormGroup;
  public readonly formModel = signal<UntypedFormGroup>(undefined);

  /**
   * The questions in the form, as a new list whenever one is added or removed.
   */
  public readonly fields = signal<Array<AbstractControl>>([]);

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
    });

    this.formModel.set(
      this.fb.group({
        fields: this.fb.array([]),
        allowSubmissions: [false],
        scoringOpensAt: [null],
        scoringClosesAt: [null]
      })
    );

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

      if (res && res.form.model) {
        this.formModel.set(
          this.fb.group({
            allowSubmissions: [res.allowSubmissions],
            scoringOpensAt: [asDate(res.scoringOpensAt)],
            scoringClosesAt: [asDate(res.scoringClosesAt)],
            fields: this.fb.array(
              res.form.model.map((q) => {
                return this.fb.group({ ...q, options: q.options.length > 0 ? this.fb.array(q.options) : this.fb.array([]) });
              })
            )
          })
        );
        this._syncFields();
      }
    });
  }

  public getSchema() {
    const r = this.loadSchemaForm.getRawValue();

    this.urlFields$ = this.http.get<IEsriRestLayerSchema>(r.source).pipe(pluck('fields'), shareReplay());

    this.urlFields$
      .pipe(
        map((fields) => {
          return fields.reduce((arr, field) => {
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
        })
      )
      .subscribe((controls) => {
        const fieldsArray = this.formModel().get('fields') as UntypedFormArray;
        fieldsArray.clear();
        controls.forEach((control) => {
          fieldsArray.push(control);
        });
        this._syncFields();
      });
  }

  /**
   * A moment of the scoring window as GIS Day's own clock reads it, so an admin sees the Central time saved
   * whatever their computer is set to (#2474). "No limit" when it is empty.
   */
  public inCentralTime(value: Date | string | null | undefined): string {
    const date = asDate(value);

    if (!date) {
      return 'No limit';
    }

    const text = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);

    // Newer ICU puts a narrow no-break space before AM and PM.
    return `${text.replace(/\u202f/g, ' ')} Central`;
  }

  /** Empties one side of the scoring window: no limit on that side. */
  public clearScoringMoment(control: 'scoringOpensAt' | 'scoringClosesAt'): void {
    this.formModel().get(control).setValue(null);
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
          if (season) {
            return this.fs.updateForm(season.form.guid, payload);
          } else {
            return this.fs.createFormModelForActiveSeason(payload);
          }
        })
      )
      .subscribe();
  }

  private _syncFields() {
    this.fields.set([...(this.formModel().get('fields') as UntypedFormArray).controls]);
  }
}

interface IEsriRestLayerSchema {
  fields: Array<Field>;
}

export interface Field extends esri.Field {
  domain: esri.CodedValueDomain;
}

/**
 * A moment as a date, from a date or the text the API sends, or `null` for none or an unreadable one.
 */
function asDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value as string);

  return isNaN(date.getTime()) ? null : date;
}

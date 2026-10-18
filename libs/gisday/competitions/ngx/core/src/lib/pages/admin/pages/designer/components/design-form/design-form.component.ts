import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, inject, output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { CompetitionSeason, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { DesignQuestionComponent } from '../design-question/design-question.component';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent, CheckboxComponent, DesignQuestionComponent]
})
export class DesignFormComponent implements OnInit {
  private readonly fb = inject(UntypedFormBuilder);
  private readonly http = inject(HttpClient);
  private readonly fs = inject(FormService);

  public readonly updated = output<Array<ICompetitionSeasonFormQuestion>>();

  public currentSeasonForm$: Observable<CompetitionSeason>;
  public urlFields$: Observable<Array<Field>>;
  public loadSchemaForm: UntypedFormGroup;
  public formModel: UntypedFormGroup;

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
    });

    this.formModel = this.fb.group({
      fields: this.fb.array([]),
      allowSubmissions: [false]
    });

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
        // Fill the existing form rather than replacing it, so the valueChanges subscription below keeps
        // seeing edits (#1876). Silently, because the saved model is emitted once below.
        this.formModel.setControl(
          'fields',
          this.fb.array(
            res.form.model.map((q) => {
              return this.fb.group({ ...q, options: q.options.length > 0 ? this.fb.array(q.options) : this.fb.array([]) });
            })
          ),
          { emitEvent: false }
        );
        this.formModel.patchValue({ allowSubmissions: res.allowSubmissions }, { emitEvent: false });

        this.updated.emit(res.form.model);
      }
    });

    this.formModel.valueChanges.pipe(startWith(this.formModel.getRawValue())).subscribe((changes) => {
      this.updated.emit(changes.fields);
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
                      return this.fb.control({ name: cv.name, value: cv.code });
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
        const fieldsArray = this.formModel.get('fields') as UntypedFormArray;
        fieldsArray.clear();
        controls.forEach((control) => {
          fieldsArray.push(control);
        });
      });
  }

  public removeQuestion(index: number) {
    const fieldsArray = this.formModel.get('fields') as UntypedFormArray;
    fieldsArray.removeAt(index);

    this.updated.emit(this.formModel.getRawValue().fields);
  }

  public saveForm(): void {
    const sourceForm = this.loadSchemaForm.getRawValue();
    const modelForm = this.formModel.getRawValue();
    const fields = modelForm.fields;

    const payload = {
      form: {
        source: sourceForm.source,
        model: [...fields]
      },
      season: {
        allowSubmissions: modelForm.allowSubmissions
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
}

interface IEsriRestLayerSchema {
  fields: Array<Field>;
}

export interface Field extends esri.Field {
  domain: esri.CodedValueDomain;
}

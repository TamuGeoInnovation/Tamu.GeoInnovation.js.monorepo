import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { CompetitionForm, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
import { FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss']
})
export class DesignFormComponent implements OnInit {
  @Output()
  public updated: EventEmitter<Array<ICompetitionSeasonFormQuestion>> = new EventEmitter();

  public currentSeasonForm$: Observable<CompetitionForm>;
  public urlFields$: Observable<Array<Field>>;
  public loadSchemaForm: FormGroup;
  public formModel: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly http: HttpClient, private readonly fs: FormService) {}

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
    });

    this.currentSeasonForm$ = this.fs.getFormForActiveSeason().pipe(
      catchError(() => {
        return of(null);
      }),
      shareReplay()
    );

    this.currentSeasonForm$.subscribe((res) => {
      if (res && res.source) {
        this.loadSchemaForm.patchValue({ source: res.source });
      }

      if (res && res.model) {
        this.formModel = this.fb.group({
          fields: this.fb.array(
            res.model.map((q) => {
              return this.fb.group({ ...q, options: q.options.length > 0 ? this.fb.array(q.options) : this.fb.array([]) });
            })
          )
        });

        this.updated.next(res.model);
      }
    });
  }

  public getSchema() {
    const r = this.loadSchemaForm.getRawValue();

    this.urlFields$ = this.http.get<IEsriRestLayerSchema>(r.source).pipe(pluck('fields'), shareReplay());

    this.urlFields$
      .pipe(
        map((fields) => {
          return fields.reduce(
            (arr, field, index) => {
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
                title: [`Question ${index + 1}: ${field.alias}`],
                instructions: [''],
                enabled: [true],
                options: options,
                type: [type]
              });

              (arr.get('fields') as FormArray).push(groupControl);

              return arr;
            },
            this.fb.group({
              fields: this.fb.array([])
            })
          );
        })
      )
      .subscribe((res) => {
        this.formModel = res;

        this.formModel.valueChanges.pipe(startWith(this.formModel.getRawValue())).subscribe((changes) => {
          this.updated.next(changes.fields);
        });
      });
  }

  public saveForm(): void {
    const sourceForm = this.loadSchemaForm.getRawValue();
    const fieldsForm = this.formModel.getRawValue().fields;

    const payload = { source: sourceForm.source, model: [...fieldsForm] } as CompetitionForm;

    this.currentSeasonForm$
      .pipe(
        switchMap((form) => {
          if (form) {
            return this.fs.updateFormModelForActiveSeason(form.guid, payload);
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

import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map, pluck, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { CompetitionSeason, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
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

  public currentSeasonForm$: Observable<CompetitionSeason>;
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
      if (res && res.form && res.form.source) {
        this.loadSchemaForm.patchValue({ source: res.form.source });
      }

      if (res && res.form.model) {
        this.formModel = this.fb.group({
          allowSubmissions: [res.allowSubmissions],
          fields: this.fb.array(
            res.form.model.map((q) => {
              return this.fb.group({ ...q, options: q.options.length > 0 ? this.fb.array(q.options) : this.fb.array([]) });
            })
          )
        });

        this.updated.next(res.form.model);
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
            (arr, field) => {
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
                options: options,
                type: [type]
              });

              (arr.get('fields') as FormArray).push(groupControl);

              return arr;
            },
            this.fb.group({
              fields: this.fb.array([]),
              allowSubmissions: [false]
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

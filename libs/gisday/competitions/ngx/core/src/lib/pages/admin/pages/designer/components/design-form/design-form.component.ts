import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay, startWith } from 'rxjs/operators';

import { CompetitionForm, ICompetitionSeasonFormQuestion } from '@tamu-gisc/gisday/competitions/data-api';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
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

  public loadSchemaForm: FormGroup;
  public urlFields: Observable<Array<Field>>;
  public formModel: FormArray;

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly fs: FormService,
    private readonly route: ActivatedRoute,
    private readonly ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
    });

    const year = new Date().getFullYear().toString();

    this.fs.getFormForSeason(year).subscribe((res) => {
      if (res && res.source) {
        this.loadSchemaForm.patchValue({ source: res.source });
      }

      if (res && res.model) {
        this.formModel = this.fb.array(
          res.model.map((q) => {
            return this.fb.group({ ...q, options: q.options.length > 0 ? this.fb.array(q.options) : this.fb.array([]) });
          })
        );

        this.updated.next(res.model);
      }
    });
  }

  public getSchema() {
    const r = this.loadSchemaForm.getRawValue();

    this.urlFields = this.http.get<IEsriRestLayerSchema>(r.source).pipe(pluck('fields'), shareReplay());

    this.urlFields
      .pipe(
        map((fields) => {
          return fields.reduce((arr, field, index) => {
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

            arr.push(groupControl);

            return arr;
          }, this.fb.array([]));
        })
      )
      .subscribe((res) => {
        this.formModel = res;

        this.formModel.valueChanges.pipe(startWith(this.formModel.getRawValue())).subscribe((changes) => {
          this.updated.next(changes);
        });
      });
  }

  public saveForm(): void {
    const sourceForm = this.loadSchemaForm.getRawValue();
    const fieldsForm = this.formModel.getRawValue();

    const guid = this.route.snapshot.queryParams.season;
    const payload = { source: sourceForm.source, model: [...fieldsForm] } as CompetitionForm;

    console.log(payload);

    this.fs.saveFormModelForSeason(guid, payload).subscribe(
      () => {
        this.ns.toast({
          id: 'designer-form-signed',
          message: 'Form was saved successfully.',
          title: 'Form Saved'
        });
      },
      () => {
        this.ns.toast({
          id: 'designer-form-signed-failed',
          message: 'There was an error saving the form.',
          title: 'Form Save Error'
        });
      }
    );
  }
}

interface IEsriRestLayerSchema {
  fields: Array<Field>;
}

export interface Field extends esri.Field {
  domain: esri.CodedValueDomain;
}

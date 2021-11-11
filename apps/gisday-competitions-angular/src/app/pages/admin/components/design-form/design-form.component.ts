import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, pluck, shareReplay } from 'rxjs/operators';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-design-form',
  templateUrl: './design-form.component.html',
  styleUrls: ['./design-form.component.scss']
})
export class DesignFormComponent implements OnInit {
  public loadSchemaForm: FormGroup;
  public urlFields: Observable<Array<Field>>;
  public formModel: FormArray;

  constructor(private readonly fb: FormBuilder, private readonly http: HttpClient) {}

  public ngOnInit(): void {
    this.loadSchemaForm = this.fb.group({
      source: ''
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
      });
  }

  public saveForm() {
    const sourceForm = this.loadSchemaForm.getRawValue();
    const fieldsForm = this.formModel.getRawValue();

    console.log({ source: sourceForm.source, model: [...fieldsForm] });
  }
}

interface IEsriRestLayerSchema {
  fields: Array<Field>;
}

export interface Field extends esri.Field {
  domain: esri.CodedValueDomain;
}
